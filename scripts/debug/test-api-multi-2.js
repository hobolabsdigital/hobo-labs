const messages = [
  { "role": "user", "content": "Create a hero node for a tech startup" },
  { 
    "role": "assistant", 
    "content": "", 
    "parts": [
      {
        "type": "tool-invocation",
        "toolInvocation": {
          "toolCallId": "call_123",
          "toolName": "createNode",
          "args": {},
          "state": "result",
          "result": {"success": true}
        }
      }
    ]
  },
  { "role": "user", "content": "Create another node" }
];

fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages })
}).then(res => res.text()).then(console.log).catch(console.error);
