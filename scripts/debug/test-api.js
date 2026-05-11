const messages = [
  { "role": "user", "content": "Create a hero node" },
  { "role": "assistant", "content": "", "toolInvocations": [{ "toolCallId": "call_123", "toolName": "createNode", "args": {} }] },
  { "role": "tool", "content": [{"type": "tool-result", "toolCallId": "call_123", "toolName": "createNode", "result": {"success": true}}] }
];

fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages })
}).then(res => res.text()).then(console.log).catch(console.error);
