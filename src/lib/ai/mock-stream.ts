/**
 * Mock stream for development/testing.
 * Returns a pre-baked hero node creation without hitting Ollama.
 */
export function createMockStreamResponse(): Response {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

      controller.enqueue(encoder.encode('0:"Thinking about the design...\\\\n"\\n'));
      await delay(1000);

      const toolCall = {
        toolCallId: `call_${Date.now()}`,
        toolName: 'createNode',
        args: {
          type: 'hero',
          headline: 'MOCK GENERATION',
          subline: 'This node was spawned instantly via the Route Handler.',
        },
      };

      controller.enqueue(encoder.encode(`9:${JSON.stringify(toolCall)}\n`));
      await delay(500);

      controller.enqueue(encoder.encode('0:"\\\\nNode generated successfully."\\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
