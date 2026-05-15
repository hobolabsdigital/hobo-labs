fetch('http://localhost:3000/api/project-context', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ slug: 'monstory', messages: [] })
}).then(res => res.text()).then(text => console.log(text.slice(0, 500) + '...'));
