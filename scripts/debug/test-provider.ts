import { ollama } from 'ai-sdk-ollama';
import { streamText, convertToModelMessages, tool } from 'ai';
import { z } from 'zod';

const messages = [
  {
    "id": "syTtFonXy60oohBB",
    "role": "assistant",
    "parts": [
      {
        "type": "text",
        "text": "Hello text",
        "providerMetadata": {
          "openai": {
            "itemId": "msg_275512"
          }
        },
        "state": "streaming"
      },
      {
        "type": "tool-createNode",
        "toolCallId": "call_31dmxyz1",
        "state": "output-available",
        "input": {
          "type": "hero"
        },
        "output": {
          "success": true
        },
        "callProviderMetadata": {
          "openai": {
            "itemId": "fc_192404_0"
          }
        }
      }
    ]
  }
];

async function run() {
  try {
    const coreMessages = await convertToModelMessages(messages as any);
    
    const result = streamText({
      model: ollama('deepseek-coder'),
      messages: coreMessages,
      tools: {
        createNode: tool({
          description: 'create node',
          inputSchema: z.object({ type: z.string() })
        })
      }
    });

    for await (const chunk of result.textStream) {
      process.stdout.write(chunk);
    }
    console.log('\nSuccess!');
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

run();
