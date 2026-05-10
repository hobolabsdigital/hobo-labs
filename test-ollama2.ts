import { streamText } from 'ai';
import { createOllama } from 'ollama-ai-provider';
const ollama = createOllama({ baseURL: 'http://127.0.0.1:11434/api' });

async function main() {
  try {
    const result = streamText({
      model: ollama('deepseek-v4-pro:cloud'),
      messages: [{ role: 'user', content: 'What is 17x23?' }],
    });
    let hasReasoning = false;
    for await (const chunk of result.fullStream) {
      if (chunk.type === 'reasoning-delta') hasReasoning = true;
    }
    console.log('hasReasoning:', hasReasoning);
  } catch (e) {
    console.error(e);
  }
}
main();
