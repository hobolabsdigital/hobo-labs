
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <title>Emile Harmel — Portfolio</title>
  <style>
    :root {
      --bg:      oklch(97% 0.012 80);
      --surface: oklch(99% 0.005 80);
      --fg:      oklch(20% 0.02 60);
      --muted:   oklch(48% 0.015 60);
      --border:  oklch(89% 0.012 80);
      --accent:  oklch(58% 0.16 35);

      --font-display: 'Iowan Old Style', 'Charter', Georgia, serif;
      --font-body:    -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--bg);
      color: var(--fg);
      font-family: var(--font-body);
      font-size: 14px;
      line-height: 1.6;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
    }

    /* Subtle grid */
    .grid-bg {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      background-image: 
        linear-gradient(var(--border) 1px, transparent 1px),
        linear-gradient(90deg, var(--border) 1px, transparent 1px);
      background-size: 48px 48px;
      opacity: 0.4;
    }

    .canvas {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      transform-origin: 0 0;
    }

    .canvas.panning {
      cursor: grabbing;
    }

    .canvas-content {
      position: absolute;
      top: 0; left: 0;
      transform-origin: 0 0;
    }

    .connections {
      position: absolute;
      top: 0; left: 0;
      width: 1px; height: 1px;
      overflow: visible;
      pointer-events: none;
    }

    .connection-line {
      stroke: var(--border);
      stroke-width: 1.5;
      fill: none;
      stroke-dasharray: 6 4;
    }

    /* Nodes */
    .node {
      position: absolute;
      background: var(--surface);
      border: 1px solid var(--border);
      min-width: 340px;
      max-width: 440px;
      transition: border-color 0.2s;
      cursor: move;
    }

    .node:hover {
      border-color: var(--muted);
    }

    .node.selected {
      border-color: var(--fg);
    }

    .node.dragging {
      z-index: 100;
    }

    .node.user {
      background: var(--bg);
    }

    .node.project {
      min-width: 380px;
    }

    .node-header {
      padding: 18px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
    }

    .node-label {
      font-family: var(--font-body);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--muted);
      font-weight: 500;
    }

    .node-drag-handle {
      font-size: 18px;
      color: var(--border);
      cursor: move;
      letter-spacing: 2px;
    }

    .node-content {
      padding: 20px 24px;
      font-size: 14px;
      line-height: 1.7;
    }

    .node-content p {
      margin-bottom: 14px;
    }

    .node-content p:last-child {
      margin-bottom: 0;
    }

    .node-content strong {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 500;
      color: var(--fg);
    }

    /* Project node */
    .node.project .node-header {
      background: var(--bg);
    }

    .node.project .project-image {
      aspect-ratio: 16 / 10;
      background: var(--border);
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 48px;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
      overflow: hidden;
    }

    .node.project .project-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .node.project h3 {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 500;
      margin: 20px 24px 10px;
      letter-spacing: -0.01em;
    }

    .node.project .meta {
      font-family: var(--font-body);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted);
      margin: 0 24px 16px;
    }

    .node.project p {
      padding: 0 24px 18px;
      margin: 0;
      font-size: 14px;
      color: var(--fg);
    }

    .node.project ul {
      padding: 0 24px 20px 36px;
      margin: 0;
    }

    .node.project li {
      margin-bottom: 8px;
      font-size: 12px;
      color: var(--muted);
    }

    /* Connection points */
    .port {
      position: absolute;
      width: 10px;
      height: 10px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 50%;
      cursor: crosshair;
      transition: all 0.2s;
      z-index: 10;
    }

    .port:hover {
      background: var(--accent);
      border-color: var(--accent);
    }

    .port.output {
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
    }

    .port.input {
      left: -6px;
      top: 50%;
      transform: translateY(-50%);
    }

    /* Input bar */
    .input-bar {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      padding: 14px 18px;
      background: var(--surface);
      border: 1px solid var(--border);
      z-index: 1000;
    }

    .input-bar input {
      padding: 12px 16px;
      font-family: var(--font-body);
      font-size: 14px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--fg);
      outline: none;
      min-width: 360px;
    }

    .input-bar input:focus {
      border-color: var(--fg);
    }

    .input-bar input::placeholder {
      color: var(--muted);
    }

    .input-bar button {
      padding: 12px 22px;
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 500;
      border: 1px solid var(--border);
      background: var(--fg);
      color: var(--bg);
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      transition: all 0.2s;
    }

    .input-bar button:hover {
      background: var(--accent);
      border-color: var(--accent);
    }

    /* Quick prompts */
    .prompts {
      position: fixed;
      top: 28px;
      right: 28px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 1000;
    }

    .prompt-btn {
      padding: 11px 18px;
      font-family: var(--font-body);
      font-size: 11px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      transition: all 0.2s;
    }

    .prompt-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    /* Zoom controls */
    .zoom-controls {
      position: fixed;
      bottom: 28px;
      right: 28px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 1000;
    }

    .zoom-btn {
      width: 40px;
      height: 40px;
      font-family: var(--font-body);
      font-size: 18px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--fg);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .zoom-btn:hover {
      border-color: var(--fg);
    }

    /* Instructions */
    .instructions {
      position: fixed;
      top: 28px;
      left: 28px;
      padding: 18px 20px;
      background: var(--surface);
      border: 1px solid var(--border);
      font-size: 11px;
      z-index: 1000;
      max-width: 240px;
    }

    .instructions h3 {
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 12px;
      letter-spacing: -0.01em;
    }

    .instructions ul {
      padding-left: 16px;
      color: var(--muted);
    }

    .instructions li {
      margin-bottom: 6px;
    }

    /* Typing indicator */
    .typing {
      display: inline-flex;
      gap: 5px;
      padding: 4px 0;
    }

    .typing span {
      width: 6px;
      height: 6px;
      background: var(--muted);
      border-radius: 50%;
      animation: pulse 1.4s infinite;
    }

    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    /* Delete button */
    .node-delete {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 22px;
      height: 22px;
      background: var(--surface);
      color: var(--fg);
      border: 1px solid var(--border);
      border-radius: 50%;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      cursor: pointer;
      z-index: 20;
      font-family: var(--font-display);
    }

    .node.selected .node-delete {
      display: flex;
    }

    .node-delete:hover {
      border-color: var(--fg);
    }

    /* Wordmark */
    .wordmark {
      position: fixed;
      top: 28px;
      left: 50%;
      transform: translateX(-50%);
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 500;
      letter-spacing: -0.02em;
      z-index: 1000;
      color: var(--fg);
    }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  
  <div class="wordmark">Emile Harmel</div>

  <div class="canvas" id="canvas">
    <div class="canvas-content" id="canvasContent">
      <svg class="connections" id="connections"></svg>
      <div id="nodes"></div>
    </div>
  </div>

  <div class="instructions">
    <h3>Navigation</h3>
    <ul>
      <li>Drag from empty space to pan</li>
      <li>Drag from node header to move</li>
      <li>Scroll to zoom</li>
      <li>Click node to select</li>
      <li>Type to branch conversation</li>
    </ul>
  </div>

  <div class="prompts">
    <button class="prompt-btn" onclick="addPrompt('work')">Work</button>
    <button class="prompt-btn" onclick="addPrompt('process')">Process</button>
    <button class="prompt-btn" onclick="addPrompt('about')">About</button>
    <button class="prompt-btn" onclick="addPrompt('contact')">Contact</button>
  </div>

  <div class="input-bar">
    <input type="text" id="userInput" placeholder="Ask about my work, process…" autocomplete="off" />
    <button onclick="sendMessage()">Send</button>
  </div>

  <div class="zoom-controls">
    <button class="zoom-btn" onclick="zoomIn()">+</button>
    <button class="zoom-btn" onclick="zoomOut()">−</button>
    <button class="zoom-btn" onclick="resetView()">⟲</button>
  </div>

  <script>
    const state = {
      scale: 1,
      panX: 0,
      panY: 0,
      isPanning: false,
      lastX: 0,
      lastY: 0,
      nodes: [],
      connections: [],
      nodeId: 0,
      selectedNode: null,
      draggingNode: null,
      dragOffsetX: 0,
      dragOffsetY: 0
    };

    const canvas = document.getElementById('canvas');
    const canvasContent = document.getElementById('canvasContent');
    const nodesEl = document.getElementById('nodes');
    const connectionsEl = document.getElementById('connections');
    const inputEl = document.getElementById('userInput');

    // Portfolio data — Emile Harmel
    const portfolio = {
      name: "Emile Harmel",
      role: "Designer & Developer",
      location: "[City]",
      email: "hello@emileharmel.com",
      projects: [
        {
          title: "Project One",
          meta: "Brand Identity — 2024",
          description: "Complete brand system for a cultural institution. Includes identity, web presence, and editorial templates.",
          number: "01",
          image: "",
          details: ["Art direction", "Web design", "Print system"]
        },
        {
          title: "Project Two",
          meta: "E-commerce Platform — 2023",
          description: "Full redesign of checkout flow and product pages. Measurable impact on conversion and retention.",
          number: "02",
          image: "",
          details: ["UX research", "Interface design", "Frontend development"]
        },
        {
          title: "Project Three",
          meta: "Editorial Platform — 2023",
          description: "Experimental publishing platform focused on typography and reading experience.",
          number: "03",
          image: "",
          details: ["Type system", "Layout engine", "Performance optimization"]
        }
      ],
      about: "I work at the intersection of design and code. Building digital products, brand systems, and experimental web experiences with a focus on typography and restraint.",
      process: "I start with constraints — what's the real problem, who is it for, what are the limits. Then I explore broadly before narrowing down. I prototype in the browser early and believe in showing work, not telling about it."
    };

    function init() {
      addNode(80, 120, 'assistant', `
        <p><strong>Emile Harmel</strong></p>
        <p>${portfolio.role}</p>
        <p style="color: var(--muted);">Based in ${portfolio.location}</p>
        <p style="margin-top: 16px; border-top: 1px solid var(--border); padding-top: 16px;">Ask me about my work, my process, or my background. Or explore the prompts on the right.</p>
      `);
      render();
    }

    function addNode(x, y, type, content, parentId = null) {
      const id = ++state.nodeId;
      const node = { id, x, y, type, content, parentId };
      state.nodes.push(node);
      if (parentId) {
        state.connections.push({ from: parentId, to: id });
      }
      return node;
    }

    function render() {
      nodesEl.innerHTML = '';
      
      state.nodes.forEach(node => {
        const el = document.createElement('div');
        el.className = `node ${node.type}`;
        el.style.left = node.x + 'px';
        el.style.top = node.y + 'px';
        el.dataset.id = node.id;
        
        if (state.selectedNode === node.id) {
          el.classList.add('selected');
        }

        const label = node.type === 'user' ? 'You' : 'Emile';
        
        el.innerHTML = `
          <div class="node-delete" onclick="deleteNode(${node.id}); event.stopPropagation();">×</div>
          <div class="node-header" onmousedown="startNodeDrag(event, ${node.id})">
            <span class="node-label">${label}</span>
            <span class="node-drag-handle">⋮⋮</span>
          </div>
          <div class="node-content">${node.content}</div>
          <div class="port output" data-node="${node.id}" data-port="output"></div>
          <div class="port input" data-node="${node.id}" data-port="input"></div>
        `;

        el.onclick = (e) => {
          e.stopPropagation();
          selectNode(node.id);
        };

        nodesEl.appendChild(el);
      });

      renderConnections();
      updateTransform();
    }

    function renderConnections() {
      connectionsEl.innerHTML = '';
      
      state.connections.forEach(conn => {
        const fromNode = state.nodes.find(n => n.id === conn.from);
        const toNode = state.nodes.find(n => n.id === conn.to);
        if (!fromNode || !toNode) return;

        const fromX = fromNode.x + 340;
        const fromY = fromNode.y + 55;
        const toX = toNode.x;
        const toY = toNode.y + 55;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const cp1X = fromX + (toX - fromX) / 2;
        const cp1Y = fromY;
        const cp2X = toX - (toX - fromX) / 2;
        const cp2Y = toY;
        
        const d = `M ${fromX} ${fromY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${toX} ${toY}`;
        path.setAttribute('d', d);
        path.setAttribute('class', 'connection-line');
        
        connectionsEl.appendChild(path);
      });

      if (state.nodes.length > 0) {
        const maxX = Math.max(...state.nodes.map(n => n.x + 440));
        const maxY = Math.max(...state.nodes.map(n => n.y + 280));
        connectionsEl.style.width = (maxX + 100) + 'px';
        connectionsEl.style.height = (maxY + 100) + 'px';
      }
    }

    function selectNode(id) {
      state.selectedNode = id;
      render();
    }

    function deleteNode(id) {
      state.nodes = state.nodes.filter(n => n.id !== id);
      state.connections = state.connections.filter(c => c.from !== id && c.to !== id);
      if (state.selectedNode === id) state.selectedNode = null;
      render();
    }

    function startNodeDrag(e, nodeId) {
      e.stopPropagation();
      state.draggingNode = nodeId;
      const node = state.nodes.find(n => n.id === nodeId);
      state.dragOffsetX = e.clientX - node.x;
      state.dragOffsetY = e.clientY - node.y;
      
      const nodeEl = document.querySelector(`.node[data-id="${nodeId}"]`);
      if (nodeEl) nodeEl.classList.add('dragging');
    }

    window.addEventListener('mousemove', (e) => {
      if (state.draggingNode) {
        const node = state.nodes.find(n => n.id === state.draggingNode);
        if (node) {
          node.x = e.clientX - state.dragOffsetX;
          node.y = e.clientY - state.dragOffsetY;
          render();
        }
        return;
      }

      if (state.isPanning) {
        state.panX += e.clientX - state.lastX;
        state.panY += e.clientY - state.lastY;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        updateTransform();
      }
    });

    window.addEventListener('mouseup', () => {
      if (state.draggingNode) {
        const nodeEl = document.querySelector(`.node[data-id="${state.draggingNode}"]`);
        if (nodeEl) nodeEl.classList.remove('dragging');
        state.draggingNode = null;
      }
      state.isPanning = false;
      canvas.classList.remove('panning');
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('port') || e.target.closest('.node')) return;
      state.isPanning = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      canvas.classList.add('panning');
    });

    function updateTransform() {
      canvasContent.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
    }

    function zoomIn() {
      state.scale = Math.min(state.scale * 1.2, 3);
      updateTransform();
    }

    function zoomOut() {
      state.scale = Math.max(state.scale / 1.2, 0.3);
      updateTransform();
    }

    function resetView() {
      state.scale = 1;
      state.panX = 0;
      state.panY = 0;
      updateTransform();
    }

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      state.scale = Math.max(0.3, Math.min(3, state.scale * delta));
      updateTransform();
    });

    function addPrompt(text) {
      inputEl.value = text;
      sendMessage();
    }

    function sendMessage() {
      const text = inputEl.value.trim();
      if (!text) return;

      let startX = 80, startY = 120;
      let parentId = null;

      if (state.selectedNode) {
        const selected = state.nodes.find(n => n.id === state.selectedNode);
        startX = selected.x + 490;
        startY = selected.y;
        parentId = selected.id;
      } else if (state.nodes.length > 0) {
        const last = state.nodes[state.nodes.length - 1];
        startX = last.x + 490;
        startY = last.y;
        parentId = last.id;
      }

      addNode(startX, startY, 'user', `<p>${text}</p>`, parentId);
      inputEl.value = '';

      const response = getResponse(text);
      const responseNodes = Array.isArray(response) ? response : [response];

      responseNodes.forEach((resp, i) => {
        setTimeout(() => {
          const nodeY = startY + (i * 320);
          addNode(startX + 490, nodeY, resp.type || 'assistant', resp.content, state.nodes[state.nodes.length - 1].id);
          render();
        }, 400 + (i * 200));
      });

      render();
    }

    function getResponse(text) {
      const lower = text.toLowerCase();
      
      if (lower.includes('project') || lower.includes('work') || lower.includes('show') || lower.includes('portfolio')) {
        return portfolio.projects.map((p, i) => ({
          type: 'project',
          content: `
            <div class="project-image">${p.image ? `<img src="${p.image}" alt="${p.title}">` : p.number}</div>
            <h3>${p.title}</h3>
            <div class="meta">${p.meta}</div>
            <p>${p.description}</p>
            ${p.details ? `<ul>${p.details.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
          `
        }));
      }
      
      if (lower.includes('process') || lower.includes('how') || lower.includes('approach')) {
        return { content: `
          <p><strong>Constraints first.</strong></p>
          <p>${portfolio.process}</p>
          <p style="color: var(--muted); margin-top: 14px;">I ship early. I iterate in public.</p>
        `};
      }
      
      if (lower.includes('about') || lower.includes('background') || lower.includes('you') || lower.includes('who')) {
        return { content: `
          <p><strong>${portfolio.name}</strong></p>
          <p>${portfolio.role}</p>
          <p style="margin-top: 14px;">${portfolio.about}</p>
          <p style="color: var(--muted); margin-top: 14px; border-top: 1px solid var(--border); padding-top: 14px;">[Previous roles, education, notable clients — from your CV]</p>
        `};
      }
      
      if (lower.includes('contact') || lower.includes('email') || lower.includes('touch') || lower.includes('reach')) {
        return { content: `
          <p><strong>${portfolio.email}</strong></p>
          <p style="color: var(--muted); margin-top: 10px;">I respond within 24–48 hours.</p>
          <p style="color: var(--muted);">For project inquiries, include timeline and budget range.</p>
        `};
      }
      
      if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
        return { content: `
          <p>Hey. I'm ${portfolio.name}.</p>
          <p style="color: var(--muted);">Ask me about my work, process, or background. Or tell me what you're looking for.</p>
        `};
      }
      
      return { content: `
        <p>Thanks for reaching out.</p>
        <p style="color: var(--muted);">Ask me about my projects, my process, or my background. Or try one of the prompts on the right.</p>
      `};
    }

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    init();
  </script>
</body>
</html>
