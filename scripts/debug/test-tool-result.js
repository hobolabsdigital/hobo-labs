import { convertToModelMessages } from 'ai';

const messages = [
  { role: 'user', id: '1', parts: [{ type: 'text', text: 'Hello' }] },
  { role: 'assistant', id: '2', parts: [{ type: 'tool-invocation', toolInvocation: { toolCallId: 'call_1', toolName: 'createNode', args: {} } }] },
  { role: 'tool', id: '3', parts: [{ type: 'tool-result', toolCallId: 'call_1', toolName: 'createNode', result: { success: true } }] }
];

async function main() {
  try {
    const coreMessages = await convertToModelMessages(messages);
    console.log(JSON.stringify(coreMessages, null, 2));
  } catch (e) {
    console.error(e);
  }
}
main();
