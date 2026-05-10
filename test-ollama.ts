import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
const ollama = createOpenAI({ baseURL: 'http://127.0.0.1:11434/v1', apiKey: 'ollama' });

async function main() {
  try {
    const result = streamText({
      model: ollama('deepseek-v4-pro:cloud'),
      messages: [{ role: 'user', content: 'What is 17x23?' }],
    });
    for await (const chunk of result.fullStream) {
      console.log(chunk);
    }
  } catch (e) {
    console.error(e);
  }
}
main();
