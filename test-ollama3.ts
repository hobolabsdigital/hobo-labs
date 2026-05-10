import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
const ollama = createOpenAI({ baseURL: 'http://127.0.0.1:11434/v1', apiKey: 'ollama' });

async function main() {
  try {
    const result = streamText({
      model: ollama('deepseek-v4-pro:cloud'),
      messages: [{ role: 'user', content: 'Create a node with the word hello.' }],
      tools: {
        createNode: tool({
          description: 'Create a node',
          parameters: z.object({ text: z.string() }),
          execute: async () => 'done',
        }),
      },
    });
    for await (const chunk of result.fullStream) {
      if (chunk.type === 'reasoning-delta') console.log('thinking...', chunk.text);
      if (chunk.type === 'text-delta') console.log('text...', chunk.text);
      if (chunk.type === 'tool-call') console.log('tool...', chunk.toolName);
    }
  } catch (e) {
    console.error(e);
  }
}
main();
