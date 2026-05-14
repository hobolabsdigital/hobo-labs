# Canvas Layout & Camera Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Constrain all canvas node heights, fix D3 physics collision radii, enforce left-to-right flow, and replace the fighting camera systems with a single track-latest approach.

**Architecture:** Each node type gets a predictable bounding box via CSS constraints. D3 `forceCollide` uses per-type radii matching these boxes. A new `forceX` pushes nodes rightward by creation order. The camera tracks only the latest active node via `setCenter`, with `fitView` reserved exclusively for timeline scrubbing.

**Tech Stack:** React, @xyflow/react, d3-force, framer-motion, CSS

**Spec:** [2026-05-14-canvas-layout-camera-design.md](../specs/2026-05-14-canvas-layout-camera-design.md)

---

### Task 1: System Prompt — Output Constraints

**Files:**
- Modify: `src/lib/ai/prompts.ts`

- [ ] **Step 1: Add output constraints to the system prompt**

In `src/lib/ai/prompts.ts`, add an `OUTPUT CONSTRAINTS` section before the closing backtick of the template literal in `buildSystemPrompt`:

```typescript
// Add after the TOOL USAGE section (after line 44), before the closing backtick:

## OUTPUT CONSTRAINTS
- Text responses: 2-3 paragraphs maximum, 120 words total. Each paragraph is 2-3 sentences.
- Hero headlines: MUST be 2-3 stacked lines using \\\\n. Each line is 2-4 words. NEVER write a single long horizontal line.
- After calling a tool, your reflection text must be 1-2 sentences maximum. Do not restate what the tool did.
- If the user asks a broad question, give a focused answer and offer to dive deeper on specifics.
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/portfolio && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/prompts.ts
git commit -m "feat: add output length constraints to system prompt"
```

---

### Task 2: HeroNode — Bounded Width

**Files:**
- Modify: `src/features/canvas/components/nodes/HeroNode.tsx`

- [ ] **Step 1: Add max-width and fix overflow behavior**

In `src/features/canvas/components/nodes/HeroNode.tsx`, make two changes:

1. Add `style={{ maxWidth: '900px' }}` to the outer `motion.div` container (line 27):

```tsx
// Before:
className="relative flex flex-col items-start bg-transparent origin-bottom-left"

// After:
className="relative flex flex-col items-start bg-transparent origin-bottom-left"
style={{ maxWidth: '900px' }}
```

2. On the `<h1>` elements (line 31), replace `whitespace-nowrap` with `overflow-wrap: break-word`:

```tsx
// Before:
className="text-7xl md:text-9xl font-sans font-medium text-foreground leading-[0.85] tracking-tighter uppercase whitespace-nowrap"

// After:
className="text-7xl md:text-9xl font-sans font-medium text-foreground leading-[0.85] tracking-tighter uppercase"
style={{ overflowWrap: 'break-word' }}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/portfolio && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/canvas/components/nodes/HeroNode.tsx
git commit -m "fix: bound HeroNode width to 900px, replace whitespace-nowrap with overflow-wrap"
```

---

### Task 3: TextNode — Constrained Height with Fade

**Files:**
- Modify: `src/features/canvas/components/nodes/TextNode.tsx`

- [ ] **Step 1: Add max-height and bottom-fade mask to the TextNode container**

In `src/features/canvas/components/nodes/TextNode.tsx`, modify the outer `motion.div` in the `TextNode` component (line 59):

```tsx
// Before:
className="max-w-md p-6 bg-[var(--background)] relative border-l-2 border-foreground origin-bottom-right"

// After:
className="max-w-md p-6 bg-[var(--background)] relative border-l-2 border-foreground origin-bottom-right"
style={{
  maxHeight: '280px',
  overflow: 'hidden',
  WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
  maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
}}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/portfolio && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/canvas/components/nodes/TextNode.tsx
git commit -m "fix: cap TextNode height at 280px with bottom-fade mask"
```

---

### Task 4: GhostNode — Constrained Streaming Window + Collapsed Final

**Files:**
- Modify: `src/features/canvas/components/nodes/GhostNode.tsx`

- [ ] **Step 1: Add constrained viewport for active streaming text**

Rewrite the `GhostText` component to constrain the streaming window and handle three states: thinking (constrained viewport), collapsed badge, and expanded (scrollable):

```tsx
const GhostText = React.memo(function GhostText({ id, fallbackText, isFinished, isExpanded }: { id: string, fallbackText: string, isFinished: boolean, isExpanded: boolean }) {
  const streamedText = useCanvasStore(state => state.activeGhostId === id ? state.activeGhostText : null);
  const textToDisplay = streamedText !== null ? streamedText : fallbackText;
  const textRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom during streaming so latest reasoning is visible
  React.useEffect(() => {
    if (!isFinished && textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [textToDisplay, isFinished]);

  // Finished + collapsed = show nothing (badge only)
  if (isFinished && !isExpanded) return null;

  // Finished + expanded = scrollable full text
  if (isFinished && isExpanded) {
    return (
      <div
        ref={textRef}
        style={{ maxHeight: '300px', overflowY: 'auto' }}
        className="text-lg font-mono text-foreground/50 leading-snug whitespace-pre-wrap break-words"
      >
        {textToDisplay || "..."}
      </div>
    );
  }

  // Active streaming = constrained viewport with top-fade
  return (
    <div
      ref={textRef}
      style={{
        maxHeight: '160px',
        overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)',
      }}
      className="text-lg font-mono text-foreground/50 leading-snug whitespace-pre-wrap break-words"
    >
      {textToDisplay || "..."}
    </div>
  );
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/portfolio && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Test in browser**

Open the app, ask the AI a question. During the `[ THINKING... ]` phase:
- Verify the reasoning text stays within ~160px height
- Verify the top of the text fades out as new text pushes in
- After reasoning completes, verify it collapses to `[ + REASONING ]` badge
- Click the badge — verify full text appears in a scrollable container

- [ ] **Step 4: Commit**

```bash
git add src/features/canvas/components/nodes/GhostNode.tsx
git commit -m "fix: constrain GhostNode streaming to 160px viewport with top-fade"
```

---

### Task 5: ProjectNode — Compact Card + Expand on Click

**Files:**
- Modify: `src/features/canvas/components/nodes/ProjectNode.tsx`

- [ ] **Step 1: Add compact/expanded state and compact card layout**

In the `ProjectNode` component, add an `isExpanded` state and render a compact card by default:

```tsx
export const ProjectNode = React.memo(function ProjectNode({ data, id }: { data: any, id: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Skeleton mode — no changes
  if (data.isLoading) {
    return <ProjectSkeleton />;
  }

  const title = data.title || "UNTITLED PROJECT";
  const summary = data.summary || "Project summary not provided.";
  const content = data.content;
  const role = data.role;
  const year = data.year;
  const image = data.image || null;
  const techStack = data.techStack || [];
  const isRevealing = data.isRevealing || false;
  const problem = data.problem || "";
  const solution = data.solution || "";
  const quote = data.quote || "";

  // ... existing gallery resolution logic stays ...

  // If revealing (dossier animation), force expanded to show the typewriter
  const showExpanded = isExpanded || isRevealing;

  // ... rest of component
```

- [ ] **Step 2: Create the compact card render**

Add a `ProjectCompact` sub-component inside `ProjectNode.tsx`:

```tsx
function ProjectCompact({
  title, role, year, image, quote, onClick
}: {
  title: string; role: string; year: string;
  image: string | null; quote: string;
  onClick: () => void;
}) {
  // Resolve hero image path
  const heroSrc = image || '/portfolio/placeholder.png';

  return (
    <motion.div
      layout
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-background origin-center flex flex-col shadow-2xl border border-foreground/10 cursor-pointer group"
      style={{ width: '800px' }}
    >
      {/* Handles */}
      {['top', 'right', 'bottom', 'left'].map(pos => {
        const positionEnum = pos === 'top' ? Position.Top : pos === 'right' ? Position.Right : pos === 'bottom' ? Position.Bottom : Position.Left;
        return (
          <React.Fragment key={pos}>
            <Handle type="target" position={positionEnum} id={pos} className="opacity-0" />
            <Handle type="source" position={positionEnum} id={pos} className="opacity-0" />
          </React.Fragment>
        );
      })}

      {/* Hero image */}
      <div className="w-full aspect-video overflow-hidden bg-foreground/5">
        <img
          src={heroSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      {/* Card body */}
      <div className="p-8 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-sans font-medium tracking-tight text-foreground">{title}</h2>
          <span className="font-mono text-xs text-foreground/40">{year}</span>
        </div>

        <p className="font-mono text-xs uppercase tracking-widest text-foreground/50">{role}</p>

        {quote && (
          <p className="text-base text-foreground/60 leading-relaxed line-clamp-2 italic mt-2">
            "{quote}"
          </p>
        )}

        {/* Expand hint */}
        <div className="font-mono text-xs text-foreground/30 uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          [ CLICK TO EXPAND ]
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Wire up compact/expanded toggle in ProjectNode render**

Update the main `ProjectNode` component to conditionally render compact or expanded:

```tsx
  // Compact mode (default, unless revealing from dossier)
  if (!showExpanded) {
    return (
      <ProjectCompact
        title={title}
        role={role || ''}
        year={year || String(new Date().getFullYear())}
        image={image}
        quote={quote}
        onClick={() => setIsExpanded(true)}
      />
    );
  }

  // Expanded mode — the full editorial layout (existing code)
  // Wrap the existing expanded layout in <AnimatePresence> with a collapse button at the top
  // ... existing return statement, but add a collapse button:
```

In the existing expanded `motion.div`, add a collapse button at the very top of the flex column:

```tsx
{/* Collapse button — only show when manually expanded (not during dossier reveal) */}
{!isRevealing && (
  <button
    onClick={() => setIsExpanded(false)}
    className="self-end font-mono text-xs uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors px-2 py-1"
  >
    [ COLLAPSE ]
  </button>
)}
```

Also add `style={{ maxHeight: '900px', overflowY: 'auto' }}` to the expanded container's inner content area (below the header) so the expanded card doesn't grow past 900px.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd apps/portfolio && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Test in browser**

- Ask the AI to show a project → verify it appears as a compact card (~420px tall)
- Click the card → verify it expands to the full editorial spread
- Click `[ COLLAPSE ]` → verify it returns to compact
- During a dossier reveal (fresh project generation) → verify it goes straight to expanded with typewriter animation

- [ ] **Step 6: Commit**

```bash
git add src/features/canvas/components/nodes/ProjectNode.tsx
git commit -m "feat: compact/expanded ProjectNode with click-to-toggle"
```

---

### Task 6: Node Factories — Add Creation Index

**Files:**
- Modify: `src/features/canvas/store/useCanvasStore.ts`
- Modify: `src/features/canvas/store/nodeFactories.ts`

- [ ] **Step 1: Add creation index counter to the store**

In `src/features/canvas/store/useCanvasStore.ts`, add a `nodeCreationCounter` to the state and increment it each time a node is added.

Add to the state interface:
```typescript
nodeCreationCounter: number;
```

Initialize in the store:
```typescript
nodeCreationCounter: 0,
```

In every action that creates a node (e.g., `addHero`, `addText`, `addGhost`, `addProject`, `addDossier`), increment the counter and attach it to the node's data:

```typescript
// Pattern — apply to each node-creation action:
const creationIndex = get().nodeCreationCounter;
const newNode = createXxxNode(id, data, sourceNode);
newNode.data = { ...newNode.data, creationIndex };
set(state => ({
  nodes: [...state.nodes, newNode],
  nodeCreationCounter: state.nodeCreationCounter + 1,
}));
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd apps/portfolio && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/canvas/store/useCanvasStore.ts src/features/canvas/store/nodeFactories.ts
git commit -m "feat: attach creationIndex to every new node for directional flow"
```

---

### Task 7: D3 Physics — Per-Type Collide + Directional forceX

**Files:**
- Modify: `src/features/canvas/hooks/useEditorialPhysics.ts`

- [ ] **Step 1: Replace static collide radius with per-type function**

In `useEditorialPhysics.ts`, replace the `forceCollide` initialization (line 24):

```typescript
// Before:
.force('collide', d3.forceCollide().radius((d: any) => d.type === 'hero' ? 250 : 120).iterations(2))

// After:
.force('collide', d3.forceCollide().radius((d: any) => {
  switch (d.type) {
    case 'hero':    return 300;
    case 'project': return 280;
    case 'text':    return 160;
    case 'ghost':   return 100;
    case 'dossier': return 80;
    default:        return 120;
  }
}).iterations(2))
```

- [ ] **Step 2: Add directional forceX for left-to-right flow**

After the existing forces, add a new `forceX` that pushes nodes rightward based on their creation index. Add this in the simulation initialization block (after line 25):

```typescript
.force('x-flow', d3.forceX().x((d: any) => {
  // Hero and intro nodes are pinned — don't apply x force
  if (d.type === 'hero' || d.type === 'intro') return d.x;
  // Push each subsequent node further right
  const index = d.data?.creationIndex ?? 0;
  return index * 350;
}).strength(0.05))
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd apps/portfolio && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/features/canvas/hooks/useEditorialPhysics.ts
git commit -m "feat: per-type D3 collide radii + forceX for left-to-right flow"
```

---

### Task 8: Camera — Track Latest Node, Not Everything

**Files:**
- Modify: `src/features/canvas/components/EditorialCanvas.tsx`

- [ ] **Step 1: Replace fitView-on-track with setCenter-on-track**

In `EditorialCanvas.tsx`, replace the generic camera tracking effect (lines 106-123):

```tsx
// Before (remove this entire useEffect):
useEffect(() => {
  if (trackedNodeId && rfInstance) {
    const timeoutId = setTimeout(() => {
      rfInstance.fitView({ padding: 0.3, duration: 800, maxZoom: 1.2 });
    }, 50);
    const resetId = setTimeout(() => {
      setTrackedNodeId(null);
    }, 1500);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(resetId);
    };
  }
}, [trackedNodeId, rfInstance, setTrackedNodeId]);

// After:
useEffect(() => {
  if (trackedNodeId && rfInstance) {
    // Find the tracked node's current position
    const nodes = useCanvasStore.getState().nodes;
    const targetNode = nodes.find(n => n.id === trackedNodeId);
    if (!targetNode) return;

    // Determine zoom level based on node type
    const zoom = targetNode.type === 'project' ? 0.7 : 0.9;

    const timeoutId = setTimeout(() => {
      rfInstance.setCenter(
        targetNode.position.x + (targetNode.type === 'project' ? 400 : 200),
        targetNode.position.y + (targetNode.type === 'project' ? 200 : 100),
        { zoom, duration: 800 }
      );
    }, 50);

    // Release tracking after animation so user can pan freely
    const resetId = setTimeout(() => {
      setTrackedNodeId(null);
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(resetId);
    };
  }
}, [trackedNodeId, rfInstance, setTrackedNodeId]);
```

- [ ] **Step 2: Remove fitView from the intro-exit transition**

In the intro-exit camera effect (lines 90-103), replace the `fitView` call with a `setCenter` on the hero node:

```tsx
// Before:
if (isIntroActive) {
  rfInstance.setCenter(0, -2000, { zoom: 1, duration: 0 });
} else {
  setTimeout(() => {
    rfInstance.fitView({ padding: 0.3, duration: 2000, maxZoom: 1.2 });
  }, 50);
}

// After:
if (isIntroActive) {
  rfInstance.setCenter(0, -2000, { zoom: 1, duration: 0 });
} else {
  // Pan to the hero node area instead of fitting all nodes
  setTimeout(() => {
    rfInstance.setCenter(400, 400, { zoom: 0.9, duration: 2000 });
  }, 50);
}
```

- [ ] **Step 3: Keep fitView ONLY for time-cursor scrubbing**

The time-cursor `fitView` effect (lines 126-132) stays unchanged — this is the only place `fitView` should be called:

```tsx
// This stays as-is:
useEffect(() => {
  if (rfInstance && timeCursor !== undefined) {
    const timeoutId = setTimeout(() => {
      rfInstance.fitView({ padding: 0.3, duration: 800, maxZoom: 1.2 });
    }, 50);
    return () => clearTimeout(timeoutId);
  }
}, [timeCursor, rfInstance]);
```

- [ ] **Step 4: Throttle D3 tick camera follow**

In `useEditorialPhysics.ts`, throttle the `setCenter` call in the tick handler to prevent jitter. Only reposition if the node has moved > 20px:

```typescript
// In the simulation.on('tick') handler, replace the setCenter block:

// Before:
if (node.id === currentTrackedId && currentRfInstance) {
  currentRfInstance.setCenter(simNode.x, simNode.y, { zoom: 0.9, duration: 0 });
}

// After:
if (node.id === currentTrackedId && currentRfInstance) {
  // Only reposition camera if node moved significantly (prevents jitter)
  const lastCameraPos = (simulationRef.current as any).__lastCameraPos || { x: 0, y: 0 };
  const dx = Math.abs(simNode.x - lastCameraPos.x);
  const dy = Math.abs(simNode.y - lastCameraPos.y);
  if (dx > 20 || dy > 20) {
    currentRfInstance.setCenter(simNode.x, simNode.y, { zoom: 0.9, duration: 0 });
    (simulationRef.current as any).__lastCameraPos = { x: simNode.x, y: simNode.y };
  }
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd apps/portfolio && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Test in browser**

- Load the app → verify camera starts centered on hero area (not fitView of everything)
- Ask a question → verify camera smoothly pans to the new ghost/text nodes
- Manually pan the canvas → verify auto-tracking stops
- Ask for a project → verify camera pans to the new project card at zoom 0.7
- Use timeline scrubber → verify fitView still works for time travel

- [ ] **Step 7: Commit**

```bash
git add src/features/canvas/components/EditorialCanvas.tsx src/features/canvas/hooks/useEditorialPhysics.ts
git commit -m "feat: camera tracks latest node via setCenter, fitView reserved for timeline"
```

---

### Task 9: Final Integration Test

- [ ] **Step 1: Full TypeScript check**

Run: `cd apps/portfolio && npx tsc --noEmit`
Expected: Zero errors

- [ ] **Step 2: Full conversation flow test**

In the browser:
1. Load the app — verify hero node is bounded (~900px wide)
2. Chat with the AI — verify text responses are 2-3 paragraphs and fit within 280px
3. During reasoning — verify ghost node text is in a constrained 160px window
4. After reasoning — verify ghost collapses to badge
5. Ask for a project — verify compact card appears (~420px tall)
6. Click compact card — verify it expands to full editorial
7. Verify nodes flow left-to-right with no major overlaps
8. Verify camera follows the latest node, not fitView of everything
9. Pan manually — verify camera tracking stops

- [ ] **Step 3: Tag version**

```bash
git tag -a v0.3.0 -m "Canvas layout redesign: bounded nodes, directional flow, track-latest camera"
git push origin main --tags
```
