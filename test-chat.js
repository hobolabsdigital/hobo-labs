const args = {
  messages: [{ role: 'user', content: 'show me the monstory project', id: '1' }]
};
fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(args)
}).then(res => res.text()).then(text => console.log(text.slice(0, 1000)));
