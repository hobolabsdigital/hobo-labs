import { convertToModelMessages } from 'ai';

const messages = [
  { "role": "user", "content": "Create a hero node" },
  { "role": "assistant", "content": "", "toolInvocations": [{ "toolCallId": "call_123", "toolName": "createNode", "args": {} }] },
  { "role": "tool", "content": [{"type": "tool-result", "toolCallId": "call_123", "toolName": "createNode", "result": {"success": true}}] }
];

convertToModelMessages(messages).then(console.log).catch(console.error);
