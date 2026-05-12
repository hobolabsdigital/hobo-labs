fetch("http://localhost:3000/api/bee/soldier", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      {
        id: "1",
        role: "user",
        content: "Triggering swarm...",
        parts: [
          { type: "text", text: "Triggering swarm..." },
          { type: "file", url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", mediaType: "image/png" }
        ]
      }
    ]
  })
}).then(res => res.text()).then(console.log).catch(console.error);
