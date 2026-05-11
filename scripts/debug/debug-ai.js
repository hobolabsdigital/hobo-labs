import { convertToModelMessages } from 'ai';

const messages = [
  { "role": "user", "content": "Create a hero node for a tech startup", "parts": [{"type": "text", "text": "Create a hero node for a tech startup"}] },
  { "role": "assistant", "content": "", "parts": [{"type": "tool-invocation", "toolInvocation": {"toolCallId": "call_123", "toolName": "createNode", "args": {}}}] },
  { "role": "tool", "content": [{"type": "tool-result", "toolCallId": "call_123", "toolName": "createNode", "result": {"success": true}}], "parts": [] }
];

convertToModelMessages(messages).then(console.log).catch(console.error);
