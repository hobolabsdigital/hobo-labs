import { convertToModelMessages } from 'ai';

const messages = [
  { 
    "role": "assistant", 
    "content": "", 
    "parts": [{"type": "tool-invocation", "toolInvocation": {"toolCallId": "call_123", "toolName": "createNode", "args": {}}}] 
  }
];

convertToModelMessages(messages).then(console.log).catch(console.error);
