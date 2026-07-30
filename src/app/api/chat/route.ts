import { createUIMessageStream, createUIMessageStreamResponse, streamText, tool, convertToModelMessages } from 'ai';
import { z } from 'zod';

import { createModel, withReasoning, SAMPLING_CONFIG } from '@/lib/ai/config';
import { retrievePersonaContext, loadProjectCatalog } from '@/lib/ai/rag';
import { buildSystemPrompt } from '@/lib/ai/prompts';
import { createHeroNode, showContact, suggestPrompts } from '@/lib/ai/tools';
import { createMockStreamResponse } from '@/lib/ai/mock-stream';
import { extractUserQuery } from '@/lib/ai/messages';
import { enforceRateLimit } from '@/lib/ai/rate-limit';

const MAX_BODY_BYTES = 32 * 1024; // 32KB
const MAX_MESSAGES = 40;

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  try {
    // --- Rate limit ---
    const limited = enforceRateLimit(req);
    if (limited) return limited;

    // --- Mock mode (dev/testing only) ---
    const url = new URL(req.url);
    if (process.env.NODE_ENV !== 'production' && url.searchParams.get('mock') === 'true') {
      return createMockStreamResponse();
    }

    // --- Body size cap ---
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonError('Request body too large.', 413);
    }

    // --- Parse & convert messages ---
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return jsonError('Invalid JSON body.', 400);
    }
    const messages = Array.isArray(body)
      ? body
      : (body as { messages?: unknown[] })?.messages || [];
    if (!Array.isArray(messages) || messages.length > MAX_MESSAGES) {
      return jsonError('Too many messages.', 400);
    }
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
            showContact,
            suggestPrompts,
          },
        });

        // Merge the streamText output (reasoning, text, tool calls) into our custom stream
        const textStream = result.toUIMessageStream({ sendReasoning: true });
        writer.merge(textStream);
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error: unknown) {
    // Log detail server-side only; never echo internals to the client.
    console.error('Chat API error:', error);
    return jsonError('Something went wrong. Please try again.', 500);
  }
}
