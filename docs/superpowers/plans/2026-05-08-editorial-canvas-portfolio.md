# Editorial Canvas Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, AI-powered portfolio site that blends an infinite-canvas node interface (React Flow) with a vertical chat feed on mobile, routed by a local Ollama LLM.

**Architecture:** A Next.js App Router application in a monorepo setup. Uses React Flow for the desktop canvas and gracefully collapses on mobile. Chat interactions are managed via Vercel AI SDK's `useChat`, hitting an internal Next.js API route that queries a local Ollama model to generate structured intents. Custom React Flow nodes act as draggable magazine blocks, enhanced by Framer Motion text effects.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, React Flow, Vercel AI SDK, Ollama, shadcn/ui, Framer Motion.

---

### Task 1: Initialize Next.js Project & Dependencies

**Files:**
- Create: `apps/portfolio/package.json`
- Create: `apps/portfolio/next.config.mjs`
- Create: `apps/portfolio/tsconfig.json`

- [ ] **Step 1: Scaffold the Next.js app**
```bash
mkdir -p apps/portfolio
cd apps/portfolio
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

- [ ] **Step 2: Install dependencies**
```bash
npm install reactflow @xyflow/react ai framer-motion lucide-react clsx tailwind-merge
```

- [ ] **Step 3: Setup minimal test to verify Next.js runs**
Modify `apps/portfolio/src/app/page.tsx`:
```tsx
export default function Home() {
  return <main><h1>Portfolio Init</h1></main>;
}
```

- [ ] **Step 4: Run build to verify**
```bash
cd apps/portfolio && npm run build
```
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add apps/portfolio
git commit -m "chore: init portfolio next.js app with core deps"
```

### Task 2: Configure Design System & Fonts

**Files:**
- Modify: `apps/portfolio/tailwind.config.ts`
- Modify: `apps/portfolio/src/app/globals.css`
- Modify: `apps/portfolio/src/app/layout.tsx`

- [ ] **Step 1: Add Google Fonts to Layout**
Modify `apps/portfolio/src/app/layout.tsx` to include `next/font/google` for Space Mono and standard Google Sans imports via `<link>`.

- [ ] **Step 2: Configure Tailwind Colors**
Update `tailwind.config.ts` to include the Google Labs colors (`primary: #1a73e8`, `accent-blue`, `accent-purple`, etc.).

- [ ] **Step 3: Initialize shadcn/ui**
```bash
cd apps/portfolio
npx shadcn@latest init -y
npx shadcn@latest add button input -y
```

- [ ] **Step 4: Add CSS Grid background**
Update `globals.css` to add the subtle grid pattern class `.grid-bg`.

- [ ] **Step 5: Commit**
```bash
git add apps/portfolio
git commit -m "feat: configure tailwind, fonts, and shadcn"
```

### Task 3: Build Core Editorial Canvas

**Files:**
- Create: `apps/portfolio/src/components/EditorialCanvas.tsx`
- Modify: `apps/portfolio/src/app/page.tsx`

- [ ] **Step 1: Write EditorialCanvas Component**
Create a component that renders `<ReactFlow>` taking up `100vw` and `100vh`. Disable panning if `window.innerWidth < 768`.

- [ ] **Step 2: Render in Home Page**
Update `page.tsx` to render `<EditorialCanvas />`.

- [ ] **Step 3: Verify Canvas Renders**
```bash
cd apps/portfolio && npm run build
```
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add apps/portfolio
git commit -m "feat: core react flow canvas component"
```

### Task 4: Custom Editorial Nodes

**Files:**
- Create: `apps/portfolio/src/components/nodes/HeroNode.tsx`
- Create: `apps/portfolio/src/components/nodes/TextNode.tsx`

- [ ] **Step 1: Write HeroNode**
Create a custom React Flow node using Framer Motion that renders a large image with an SVG mask (e.g., pill shape) and a connecting `<Handle>`.

- [ ] **Step 2: Write TextNode**
Create a custom node for oversized brutalist text blocks utilizing Framer Motion for text reveals.

- [ ] **Step 3: Register Nodes in Canvas**
Update `EditorialCanvas.tsx` to use `nodeTypes={{ hero: HeroNode, text: TextNode }}`.

- [ ] **Step 4: Commit**
```bash
git add apps/portfolio
git commit -m "feat: custom editorial react flow nodes"
```

### Task 5: Vercel AI SDK Integration & Chat Bar

**Files:**
- Create: `apps/portfolio/src/components/ChatInput.tsx`

- [ ] **Step 1: Write ChatInput Component**
Build a fixed bottom bar using `shadcn/ui` Input and Button. Use `useChat()` from `ai/react` to handle submissions.

- [ ] **Step 2: Add to Page**
Add `<ChatInput />` to `page.tsx` overlaying the canvas.

- [ ] **Step 3: Commit**
```bash
git add apps/portfolio
git commit -m "feat: chat input bar with ai sdk"
```

### Task 6: Ollama Routing API

**Files:**
- Create: `apps/portfolio/src/app/api/chat/route.ts`

- [ ] **Step 1: Write API Route**
Use `streamText` from `ai` and the Ollama provider to parse the user's message. System prompt instructs Ollama to return JSON identifying the intent (`show_work`, `show_process`) and a conversational response.

- [ ] **Step 2: Verify API Compilation**
```bash
cd apps/portfolio && npm run build
```
Expected: PASS

- [ ] **Step 3: Commit**
```bash
git add apps/portfolio
git commit -m "feat: ollama api route for intent routing"
```

### Task 7: Dynamic Node Generation Logic

**Files:**
- Modify: `apps/portfolio/src/components/EditorialCanvas.tsx`

- [x] **Step 1: Hook AI Response to Nodes**
Listen to the `useChat` messages array. When an AI message arrives containing an intent payload, dynamically push a new `TextNode` (for the chat) and a `HeroNode` (for projects) to the React Flow `nodes` state.

- [x] **Step 2: Draw Bezier Edges**
Add an edge connecting the previous node to the newly spawned nodes.

- [x] **Step 3: Commit**
```bash
git add apps/portfolio
git commit -m "feat: dynamic node generation from ai intents"
```

### Task 8: Physics, Timeline Scrubber, and UI Branding

**Files:**
- Modify: `apps/portfolio/src/components/EditorialCanvas.tsx`
- Modify: `apps/portfolio/src/components/TimelineScrubber.tsx`
- Modify: `apps/portfolio/src/components/DebugPanel.tsx`
- Create: `apps/portfolio/src/components/Logo.tsx`
- Modify: `apps/portfolio/src/app/layout.tsx`

- [x] **Step 1: Debug Panel & Playground**
Added a physics debug panel bound to the right edge with a sliding toggle. Let users adjust friction, gravity, and fluid simulation settings dynamically.
- [x] **Step 2: Timeline Scrubber with Gooey Physics**
Replaced standard ranges with an SVG-based continuous track. Added Framer Motion physics for a fluid, magnetic thumb that scales up on hover and squeezes/stretches when dragged. 
- [x] **Step 3: Collision Avoidance**
Updated `TimelineScrubber` to automatically slide leftwards out of the way when the `DebugPanel` drawer is open to prevent z-index and click-target overlap.
- [x] **Step 4: Branding Integration**
Created a standalone `Logo.tsx` from `logo.svg`, implementing `currentColor` fill and `mix-blend-difference` to achieve automatic light/dark brutalist inversion over any element on the page.

### Task 9: Gemma Embeddings & Persona (NEXT PHASE)

- [ ] **Step 1: Setup Gemma Embeddings**
Implement the embeddings layer using Gemma.
- [ ] **Step 2: Model Persona Configuration**
Define and integrate a strict system persona for the editorial model.
