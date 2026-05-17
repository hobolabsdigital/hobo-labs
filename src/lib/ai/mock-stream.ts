import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';

/**
 * Mock stream for development/testing.
 * Returns a pre-baked hero node creation using the same UIMessageStream
 * protocol as the real chat route.
 */
export function createMockStreamResponse(): Response {
  const textId = `mock-text-${Date.now()}`;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: 'text-start', id: textId });
      writer.write({ type: 'text-delta', id: textId, delta: 'Thinking about the design...\n' });

      // Simulate latency
      await new Promise(res => setTimeout(res, 1000));

      // Tool call — uses `tool-input-available` which is the SDK's chunk type
      writer.write({
        type: 'tool-input-available',
        toolCallId: `call_${Date.now()}`,
        toolName: 'createHeroNode',
        input: {
          type: 'hero',
          headline: 'MOCK GENERATION',
          subline: 'This node was spawned instantly via the Route Handler.',
        },
      });

      await new Promise(res => setTimeout(res, 500));

      writer.write({ type: 'text-delta', id: textId, delta: '\nNode generated successfully.' });
      writer.write({ type: 'text-end', id: textId });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
