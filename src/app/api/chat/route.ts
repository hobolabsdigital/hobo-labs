import { createUIMessageStream, createUIMessageStreamResponse, streamText, tool, convertToModelMessages } from 'ai';
import type { UIMessageStreamWriter } from 'ai';
import { z } from 'zod';

import { createModel, withReasoning, SAMPLING_CONFIG } from '@/lib/ai/config';
import { retrievePersonaContext, loadProjectCatalog } from '@/lib/ai/rag';
import { buildSystemPrompt } from '@/lib/ai/prompts';
import { createHeroNode, suggestPrompts } from '@/lib/ai/tools';
import { getProjectStaticData } from '@/lib/ai/project-editor';
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
            }),
            suggestPrompts,
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
