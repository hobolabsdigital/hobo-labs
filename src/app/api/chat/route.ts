import { createUIMessageStream, createUIMessageStreamResponse, streamText, tool, convertToModelMessages } from 'ai';
import type { UIMessageStreamWriter } from 'ai';
import { z } from 'zod';

import { createModel, withReasoning, SAMPLING_CONFIG } from '@/lib/ai/config';
import { retrievePersonaContext, loadProjectCatalog } from '@/lib/ai/rag';
import { buildSystemPrompt } from '@/lib/ai/prompts';
import { createHeroNode, suggestPrompts } from '@/lib/ai/tools';
import { createProjectEditor } from '@/lib/ai/project-editor';
import { createMockStreamResponse } from '@/lib/ai/mock-stream';
import { extractUserQuery } from '@/lib/ai/messages';

export async function POST(req: Request) {
  try {
    // --- Mock mode (dev/testing) ---
    const url = new URL(req.url);
    if (url.searchParams.get('mock') === 'true') {
      return createMockStreamResponse();
    }

    // --- Parse & convert messages ---
    const body = await req.json();
    const messages = Array.isArray(body) ? body : body.messages || [];
    const coreMessages = await convertToModelMessages(messages);

    // --- RAG context ---
    const userQuery = extractUserQuery(coreMessages);
    const [contextText, catalogText] = await Promise.all([
      retrievePersonaContext(userQuery),
      Promise.resolve(loadProjectCatalog()),
    ]);

    // --- Model setup ---
    const isInitialGreeting = coreMessages.length === 1 && userQuery.includes('Introduce yourself');
    const model = withReasoning(createModel(!isInitialGreeting));

    // --- Stream with data annotations for dossier progress ---
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Sub-agent gets access to writer for progress events
        const { editor, getSubmittedCard, resetSubmittedCard } = createProjectEditor(writer);

        const result = streamText({
          model,
          messages: coreMessages,
          ...SAMPLING_CONFIG,
          providerOptions: { ollama: { think: true } },
          system: buildSystemPrompt({ isInitialGreeting, contextText, catalogText }),
          tools: {
            createHeroNode,
            suggestPrompts,
            showProject: tool({
              description: 'Show a project case study on the canvas. Provide the project slug from context.',
              inputSchema: z.object({
                slug: z.string().describe('The project slug (e.g. "monstory", "moxis", "hermes", "find-my-mazda")'),
              }),
              execute: async ({ slug }) => {
                resetSubmittedCard();

                // Emit: dossier starting (client spawns DossierNode + skeleton)
                writer.write({
                  type: 'data-dossier',
                  data: { status: 'accessing', slug },
                });

                try {
                  // Emit: rewriting phase (timed estimate since sub-agent doesn't have a clear signal)
                  const rewritingTimeout = setTimeout(() => {
                    try {
                      writer.write({
                        type: 'data-dossier',
                        data: { status: 'rewriting' },
                      });
                    } catch { /* stream may be closed */ }
                  }, 2000);

                  await editor.generate({
                    prompt: `Create a creative editorial project card for the project with slug "${slug}".

WORKFLOW:
1. Call getProjectSource with slug "${slug}" to load the raw case study data
2. Study the raw data
3. Rewrite it into a compelling Bauhaus-style editorial project card
4. Call submitProjectCard with your completed card`,
                    abortSignal: new AbortController().signal,
                  });

                  clearTimeout(rewritingTimeout);

                  const card = getSubmittedCard();
                  if (!card) {
                    console.error('[showProject] Sub-agent did not submit a card');
                    return { error: 'Sub-agent did not submit a project card' };
                  }

                  return card;
                } catch (e: any) {
                  console.error('[showProject] Failed:', e.message);
                  return { error: `Sub-agent failed: ${e.message}` };
                }
              },
            }),
          },
        });

        // Merge the streamText output (reasoning, text, tool calls) into our custom stream
        const textStream = result.toUIMessageStream({ sendReasoning: true });
        writer.merge(textStream);
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
