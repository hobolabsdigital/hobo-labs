const messages = [
  { "role": "user", "content": "Create a hero node" }
];

fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages })
}).then(res => res.text()).then(console.log).catch(console.error);
