import { convertToModelMessages } from 'ai';

const messages = [
  {
    "parts": [
      {
        "type": "text",
        "text": "hello"
      }
    ],
    "id": "OYd1mLGNJdZEWF4u",
    "role": "user"
  },
  {
    "id": "syTtFonXy60oohBB",
    "role": "assistant",
    "parts": [
      {
        "type": "step-start"
      },
      {
        "type": "reasoning",
        "text": "The user is saying hello...",
        "providerMetadata": {
          "openai": {
            "itemId": "rs_776139",
            "reasoningEncryptedContent": "The user is saying hello..."
          }
        },
        "state": "done"
      },
      {
        "type": "text",
        "text": "Hello.\n\nThis is a raw space.",
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
          "type": "hero",
          "headline": "FORM FOLLOWS\nFRICTION",
          "subline": "The most honest design doesn't smooth the edges.",
          "animationEffect": "iris",
          "layoutIntent": "top_right"
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
  const coreMessages = await convertToModelMessages(messages as any);
  console.log(JSON.stringify(coreMessages, null, 2));
}

run().catch(console.error);
