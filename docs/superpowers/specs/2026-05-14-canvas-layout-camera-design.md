# Canvas Layout & Camera System Redesign

> **Status**: Design — awaiting review
> **Date**: 2026-05-14
> **Problem**: Nodes pile on top of each other, camera loses track of content, and unbounded node heights make D3 physics unpredictable.

## Problem Analysis

### Current State

The canvas has five node types with no consistent bounding constraints:

| Node | Width | Height | D3 Collide Radius |
|------|-------|--------|-------------------|
| HeroNode | **Unbounded** (`whitespace-nowrap`, no `max-width`) | ~200-300px | 250 |
| TextNode | `max-w-md` (448px) | **Unbounded** (grows with AI text) | 120 |
| GhostNode | `max-w-md` (448px) | **Unbounded** (grows with reasoning) | 120 |
| ProjectNode | 800px fixed | **Unbounded** (1200-1500px with full content) | 120 |
| DossierNode | 400px | Variable (150-300px) | 120 |

The D3 `forceCollide` uses a fixed radius that has no relationship to actual rendered node dimensions. An 800×1500px ProjectNode is treated as a 240px circle. Nodes overlap constantly.

### Root Causes

1. **No height constraints** — nodes grow vertically without limit based on AI output length
2. **D3 radius mismatch** — collision detection doesn't match visual reality
3. **Camera indecision** — three competing systems: `trackedNodeId` + `setCenter()`, `fitView(all)`, and time-cursor `fitView`. They fight each other on every node change.
4. **No directional flow enforcement** — nodes spawn with small random offsets but no force pushes them into a left-to-right reading order
5. **AI output unbounded** — the system prompt says "concise" but doesn't enforce specific limits

---

## Design

### 1. HeroNode — Bounded Width

**Problem**: `whitespace-nowrap` on `text-9xl` text means a single line can be 1400px+ wide if the AI doesn't use `\\n` line breaks.

**Fix**:
- Add `max-width: 900px` to the hero container
- Replace `whitespace-nowrap` with `overflow-wrap: break-word` on the `<h1>` elements
- Keep the `\\n` splitting logic — this is a CSS safety net, not a replacement for the prompt instruction
- The existing prompt instruction ("use `\\n` to stack into 2-3 lines") stays as the primary control

**Resulting bounding box**: ~900 × 300px

---

### 2. TextNode — Constrained Height + Prompt Limits

**Problem**: AI regularly outputs 5-6 paragraphs, creating text nodes that are 600-800px tall.

**Fix (prompt side)**:
- Add to system prompt: "When generating text responses, limit to 2-3 short paragraphs (max 120 words). Each paragraph should be 2-3 sentences."
- This is the primary control — the CSS is a safety net.

**Fix (CSS side)**:
- Add `max-height: 280px` to the TextNode container
- Add `overflow: hidden` (NOT `overflow-y: auto` — no scrollbars inside canvas nodes)
- Add a fade-out gradient at the bottom when content overflows: `mask-image: linear-gradient(to bottom, black 70%, transparent 100%)`
- No "read more" button needed — the content simply fades out. This is an editorial aesthetic choice, not a truncation. If the user wants to read the full text, they zoom in.

**Resulting bounding box**: ~448 × 280px (max)

---

### 3. GhostNode — Streaming Chunks + Collapsed Final

**Problem**: During reasoning, the ghost text grows unbounded as the LLM thinks. After finishing, it collapses to a `[ + REASONING ]` badge, but during active thinking the node can be 500px+ tall.

**Current behavior**:
- While thinking: shows full streaming text, pulsing `[ THINKING... ]` label, no height limit
- When finished: collapses to badge, expandable on click

**New behavior — constrained streaming window**:

While thinking:
- Show a fixed-height "viewport" of the latest reasoning chunk: `max-height: 160px`, `overflow: hidden`
- New text pushes in from the bottom, old text scrolls up and out (CSS mask fade at top)
- The user sees the *latest* reasoning, not the full history — like watching a terminal with limited scrollback
- `[ THINKING... ]` label stays with its current pulsing animation

When finished:
- Collapse to `[ + REASONING ]` badge (existing behavior, no change)
- Click to expand shows full reasoning text in a constrained box with `max-height: 300px` and `overflow-y: auto` (scrollbar is acceptable here because the user explicitly chose to expand)

**Resulting bounding box**:
- Active: ~448 × 200px (label + constrained text window)
- Finished: ~250 × 40px (badge)
- Expanded: ~448 × 340px (label + scrollable text)

---

### 4. ProjectNode — Compact Card + Expand on Click

**Problem**: The full editorial spread is 800×1500px with images, tech stack, problem/solution, gallery, and quote. This dominates the canvas and forces `fitView` to zoom out so far that everything else becomes unreadable.

**New behavior — two states**:

#### Compact State (default)
Shows a preview card with:
- Category breadcrumb (small mono text)
- Title (h2, large)
- Role subtitle
- Hero image (aspect-video, full width)
- Quote (truncated to 2 lines with ellipsis — the editorial hook)
- Year pill

Dimensions: `800px × ~420px`

No tech stack, no content paragraphs, no gallery, no problem/solution, no quote in compact mode.

#### Expanded State (click to open)
- Full editorial spread (current layout)
- Triggered by clicking anywhere on the compact card
- Node expands in-place with a smooth animation (`framer-motion` layout transition)
- D3 physics reacts to the new size, gently pushing neighbors
- A "collapse" button (or click header area) returns to compact state
- `max-height: 900px` with `overflow-y: auto` for the content area below the hero image — the card doesn't grow past this

**Resulting bounding box**:
- Compact: 800 × 420px
- Expanded: 800 × 900px (max, scrollable content area)

---

### 5. D3 Physics — Accurate Collision + Directional Flow

#### 5a. Collide Radius Per Node Type

Replace the current static `forceCollide().radius(120)` with a function that returns the actual half-diagonal based on node type:

```
function collideRadius(node) {
  switch (node.type) {
    case 'hero':    return 300;   // ~900×300 bounding box → half-diagonal ~474, use 300 for some overlap tolerance
    case 'project': return 280;   // ~800×420 compact → half-diagonal ~450, use 280
    case 'text':    return 160;   // ~448×280 → half-diagonal ~264, use 160
    case 'ghost':   return 100;   // ~448×200 active or ~250×40 badge → use 100
    case 'dossier': return 80;    // ~400×150 or badge → use 80
    default:        return 120;
  }
}
```

These are intentionally smaller than the true half-diagonal to allow some visual proximity (editorial layouts don't need rigidly separated boxes) while preventing the worst overlaps.

#### 5b. Directional Force — Left-to-Right Flow

Add a `forceX` that gently pushes nodes rightward based on their creation order:

```
.force('x-flow', d3.forceX()
  .x(node => node.creationIndex * 350)  // each node gets a "column"
  .strength(0.05)                        // gentle, not rigid
)
```

This gives the canvas a natural left-to-right reading flow:
- Hero at x=0 (already pinned)
- First response nodes around x=350
- Second exchange around x=700
- Project cards further right

The low strength (0.05) means link forces and charge still have influence — nodes aren't pinned to a grid. They just *tend* rightward.

#### 5c. Creation Index Tracking

Add a `creationIndex` field to each node when it's created in the store. This is a monotonically incrementing counter — node 1 gets index 0, node 2 gets index 1, etc. The D3 `forceX` uses this to determine target x position.

---

### 6. Camera System — Track Latest, Not Everything

#### Current Problems

Three systems fight:
1. D3 tick handler calls `setCenter(trackedNode)` every physics frame (60fps repositioning)
2. `trackedNodeId` change triggers `fitView(all nodes)` — tries to show everything
3. Time cursor change triggers another `fitView(all)`

#### New Camera Rules

**Rule 1: Track the latest active node, not all nodes.**

When a new node spawns:
- Smooth pan + zoom to frame just that node and its immediate parent (the node it's connected to via edge)
- Use `setCenter(node.x, node.y, { zoom: 0.9, duration: 800 })` — animate over 800ms
- Do NOT call `fitView()` — that zooms out to show everything, which defeats the purpose

When a ghost node is streaming:
- Camera follows it gently (already implemented via D3 tick `setCenter`)
- But cap the follow rate to prevent jitter: only reposition if the node has moved > 20px since last camera update

When a project card is revealed:
- Pan to center the project card
- Zoom to `0.7` to frame the full 800px width comfortably

**Rule 2: User gesture breaks camera tracking.**

If the user manually pans or zooms:
- Immediately stop all auto-tracking
- Set `trackedNodeId = null`
- Camera stays where the user put it until a new node spawns

**Rule 3: fitView is only for time travel.**

`fitView()` is reserved for the timeline scrubber. When the user scrubs to a different point in history, fitView frames all visible nodes at that time point. This is the only place fitView is called.

**Rule 4: "Show all" as an explicit action.**

Add a keyboard shortcut (`0` or `Cmd+0`) or a button that calls `fitView()` to show all nodes. This replaces the current auto-fitView behavior — the user chooses when to zoom out.

---

### 7. System Prompt — Output Constraints

Add these specific constraints to `buildSystemPrompt`:

```
## OUTPUT CONSTRAINTS
- Text responses: 2-3 paragraphs maximum, 120 words total. Each paragraph is 2-3 sentences.
- Hero headlines: 2-3 stacked lines using \\n. Each line is 2-4 words. NEVER write a single long line.
- After calling a tool, your reflection text must be 1-2 sentences maximum. Do not restate what the tool did.
- If the user asks a broad question, give a focused answer and offer to dive deeper on specifics.
```

---

## Node Bounding Box Summary

After all changes:

| Node | State | Width | Max Height | D3 Radius |
|------|-------|-------|------------|-----------|
| HeroNode | — | 900px | ~300px | 300 |
| TextNode | — | 448px | 280px | 160 |
| GhostNode | Thinking | 448px | 200px | 100 |
| GhostNode | Badge | 250px | 40px | 100 |
| GhostNode | Expanded | 448px | 340px | 100 |
| ProjectNode | Compact | 800px | 420px | 280 |
| ProjectNode | Expanded | 800px | 900px | 280 |
| DossierNode | Active | 400px | 300px | 80 |
| DossierNode | Badge | 250px | 32px | 80 |

---

## Files Changed

### Modified Files

| File | Changes |
|------|---------|
| `src/features/canvas/components/nodes/HeroNode.tsx` | Add `max-width: 900px`, replace `whitespace-nowrap` with `overflow-wrap: break-word` |
| `src/features/canvas/components/nodes/TextNode.tsx` | Add `max-height: 280px`, `overflow: hidden`, bottom fade gradient mask |
| `src/features/canvas/components/nodes/GhostNode.tsx` | Constrained streaming viewport (160px), top-fade mask, expanded state max-height + scrollbar |
| `src/features/canvas/components/nodes/ProjectNode.tsx` | Two-state compact/expanded card with framer-motion layout transition |
| `src/features/canvas/hooks/useEditorialPhysics.ts` | Per-type collide radius function, add `forceX` for left-to-right flow |
| `src/features/canvas/store/useCanvasStore.ts` | Add `creationIndex` to node metadata, expose via store |
| `src/features/canvas/store/nodeFactories.ts` | Attach `creationIndex` when creating nodes |
| `src/features/canvas/components/EditorialCanvas.tsx` | Rewrite camera effects: remove `fitView` calls, implement track-latest logic, add user-gesture detection |
| `src/lib/ai/prompts.ts` | Add output constraint section to system prompt |

### No New Files

All changes are modifications to existing files. No new components or hooks needed.

---

## Verification Plan

### Automated
- `tsc --noEmit` — zero TypeScript errors after changes

### Manual / Browser Testing
1. **Node sizing**: inspect each node type with DevTools, verify max-height constraints are respected
2. **HeroNode overflow**: ask AI to create a hero with a very long headline — verify it wraps instead of extending to 1400px
3. **TextNode truncation**: ask AI a broad question — verify the response fades out at 280px, doesn't grow unbounded
4. **GhostNode streaming**: during AI thinking, verify the reasoning text stays within the 160px viewport with top-fade
5. **ProjectNode compact/expand**: trigger a project card, verify it spawns compact (~420px tall), click expands to full editorial, click again collapses
6. **D3 physics**: verify nodes don't overlap after spawning. Check that newer nodes tend rightward.
7. **Camera**: verify camera pans to new nodes, doesn't fitView everything. Verify manual pan stops auto-tracking. Verify timeline scrubber still fitViews.
8. **Prompt constraints**: have a multi-turn conversation, verify AI responses stay within 2-3 paragraph limit
