import { streamText, tool, convertToModelMessages } from 'ai';
import { z } from 'zod';

import { createModel, withReasoning, SAMPLING_CONFIG } from '@/lib/ai/config';
import { retrievePersonaContext, loadProjectCatalog } from '@/lib/ai/rag';
import { buildSystemPrompt } from '@/lib/ai/prompts';
import { createHeroNode } from '@/lib/ai/tools';
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

    // --- Sub-agent ---
    const { editor, getSubmittedCard, resetSubmittedCard } = createProjectEditor();

    // --- Stream ---
    const result = streamText({
      model,
      messages: coreMessages,
      ...SAMPLING_CONFIG,
      providerOptions: { ollama: { think: true } },
      system: buildSystemPrompt({ isInitialGreeting, contextText, catalogText }),
      tools: {
        createHeroNode,
        showProject: tool({
          description: 'Show a project case study on the canvas. Provide the project slug from context.',
          inputSchema: z.object({
            slug: z.string().describe('The project slug (e.g. "monstory", "moxis", "hermes", "find-my-mazda")'),
          }),
          execute: async ({ slug }) => {
            resetSubmittedCard();

            try {
              await editor.generate({
                prompt: `Create a creative editorial project card for the project with slug "${slug}".

WORKFLOW:
1. Call getProjectSource with slug "${slug}" to load the raw case study data
2. Study the raw data
3. Rewrite it into a compelling Bauhaus-style editorial project card
4. Call submitProjectCard with your completed card`,
                abortSignal: new AbortController().signal,
              });

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

    return result.toUIMessageStreamResponse({ sendReasoning: true });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
