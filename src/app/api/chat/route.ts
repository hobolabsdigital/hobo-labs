import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

const ollama = createOpenAI({
  baseURL: 'http://127.0.0.1:11434/v1',
  apiKey: 'ollama', // API key is required but ignored by Ollama
});

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get('mock') === 'true') {
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
          
          controller.enqueue(encoder.encode('0:"Thinking about the design...\\n"\n'));
          await delay(1000);
          
          const toolCall = {
            toolCallId: `call_${Date.now()}`,
            toolName: "createNode",
            args: { type: "hero", headline: "MOCK GENERATION", subline: "This node was spawned instantly via the Route Handler." }
          };
          
          controller.enqueue(encoder.encode(`9:${JSON.stringify(toolCall)}\n`));
          await delay(500);
          
          controller.enqueue(encoder.encode('0:"\\nNode generated successfully."\n'));
          controller.close();
        }
      });
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'x-vercel-ai-data-stream': 'v1'
        }
      });
    }

    const { messages } = await req.json();

    const result = streamText({
      model: ollama('deepseek-v4-pro:cloud'),
      messages: messages,
      system: "You are the creative AI assistant for an experimental design portfolio. " +
              "Your job is to respond with brief, striking, brutalist insights. " +
              "When appropriate, generate a new node for the canvas to illustrate your point using the createNode tool.",
      tools: {
        createNode: tool({
          description: 'Create a new node on the editorial canvas',
          inputSchema: z.object({
            type: z.enum(['text', 'hero']).describe('The type of node to create'),
            headline: z.string().optional().describe('Headline for hero nodes (use uppercase, use \\n for line breaks)'),
            subline: z.string().optional().describe('Subline for hero nodes'),
            text: z.string().optional().describe('Content for text nodes'),
            label: z.string().optional().describe('Small label for text nodes (e.g. CONTEXT, INSIGHT)'),
            animationEffect: z.enum(['none', 'annotation', 'iris']).optional().describe('How to animate the text in'),
            layoutIntent: z.enum(['center', 'top_left', 'top_right', 'bottom_left', 'bottom_right', 'far_right']).optional().describe('Where to spatially drop the node before physics takes over'),
          })
        }),
      }
    });

    return result.toUIMessageStreamResponse({ sendReasoning: true });
  } catch (error: any) {
    console.error("Ollama API Error Details:", error);
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred during stream generation.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
