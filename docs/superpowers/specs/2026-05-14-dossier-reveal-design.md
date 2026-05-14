# CIA Dossier Reveal — Sub-Agent Visual Feedback System

> **Status**: Implemented (2026-05-14)

## Problem
When the main AI agent calls `showProject`, a sub-agent (ToolLoopAgent) takes ~5 seconds to generate a project card. During this time, the user sees zero visual feedback — a dead zone between the ghost reasoning node finishing and the project card appearing.

## Solution
A three-stage reveal sequence:
1. **DossierNode** — A new terminal-style canvas node that renders sub-agent progress in real-time
2. **Skeleton ProjectNode** — An empty card with shimmer placeholders that spawns simultaneously
3. **DOS Typewriter Reveal** — When data arrives, text types in character-by-character and images fade in sequentially

## User Experience Timeline

```
[1] Ghost node finishes reasoning
[2] DossierNode spawns (terminal aesthetic, scanlines, blinking cursor)
    + Skeleton ProjectNode spawns simultaneously (shimmer blocks)
[3] Progress streams line-by-line into DossierNode:
    > ACCESSING CASE FILE: OCEANA
    > SOURCE DATA LOADED: StopOverfishing (Oceana)  ✓
    > REWRITING EDITORIAL... ██████░░
    > EDITORIAL REWRITE COMPLETE ✓
    > DOSSIER COMPLETE — RENDERING CARD
[4] ProjectNode transitions from skeleton → full data:
    - Title types in char-by-char (~35ms/char)
    - Role fades in (200ms delay)
    - Hero image fades in (700ms)
    - Metadata table staggers in
    - Content paragraphs type sequentially (~8ms/char)
    - Tech stack pills pop in (100ms stagger)
    - Gallery images fade in (300ms apart)
    - Problem/Solution blocks type in
    - Quote fades in last
[5] DossierNode auto-collapses to compact badge after 2.5s: [ ✓ CASE FILE: OCEANA ]
```

## Architecture

### Server: UIMessageStream with Custom Data Chunks

The route uses `createUIMessageStream()` + `createUIMessageStreamResponse()` from the Vercel AI SDK v6. This creates a custom stream that interleaves standard LLM output (text, reasoning, tool calls) with custom `data-dossier` progress events.

```typescript
// route.ts
const stream = createUIMessageStream({
  execute: async ({ writer }) => {
    const { editor } = createProjectEditor(writer);

    const result = streamText({ model, messages, tools: { ... } });
    
    // Custom progress events via writer.write()
    writer.write({ type: 'data-dossier', data: { status: 'accessing', slug } });
    
    // Merge LLM stream into custom stream
    const textStream = result.toUIMessageStream({ sendReasoning: true });
    writer.merge(textStream);
  },
});

return createUIMessageStreamResponse({ stream });
```

#### Data Stream Events

All events use the SDK's `data-*` typed chunk format via `UIMessageStreamWriter.write()`:

| Event | Shape | Trigger |
|-------|-------|---------|
| Accessing | `{ type: 'data-dossier', data: { status: 'accessing', slug } }` | `showProject` tool starts |
| Source Loaded | `{ type: 'data-dossier', data: { status: 'source-loaded', title } }` | Sub-agent's `getProjectSource` tool returns |
| Rewriting | `{ type: 'data-dossier', data: { status: 'rewriting' } }` | Timed estimate (~2s after start) |
| Complete | `{ type: 'data-dossier', data: { status: 'complete' } }` | Sub-agent's `submitProjectCard` tool returns |

The `UIMessageStreamWriter` reference is passed from `route.ts` → `createProjectEditor(writer)` → sub-agent tool `execute` functions.

### Client: `onData` → Canvas Store

`useChat`'s `onData` callback receives `DataUIPart` objects. Dossier events are identified by `dataPart.type === 'data-dossier'` and dispatched to canvas store actions:

```typescript
onData: (dataPart: any) => {
  if (dataPart?.type === 'data-dossier' && dataPart.data) {
    const { status, slug, title } = dataPart.data;
    switch (status) {
      case 'accessing':   addDossier(slug); break;
      case 'source-loaded': updateDossierStatus('source-loaded', { title }); break;
      case 'rewriting':   updateDossierStatus('rewriting'); break;
      case 'complete':    updateDossierStatus('complete'); break;
    }
  }
}
```

### Canvas Store: Dossier Lifecycle

New state:
- `activeDossierId: string | null`
- `dossierStatus: 'idle' | 'accessing' | 'source-loaded' | 'rewriting' | 'complete'`
- `dossierSlug: string | null`
- `dossierTitle: string | null`
- `skeletonProjectId: string | null`

New actions:
- `addDossier(slug)` — creates DossierNode + skeleton ProjectNode with edges
- `updateDossierStatus(status, meta?)` — advances dossier log display
- `revealProject(data)` — fills skeleton node data, triggers typewriter animations

### DossierNode Component

- Container: `bg-black/95`, monospace font, `border border-green-500/20`
- Scanline overlay with `repeating-linear-gradient`
- Width: 400px
- Header: "SUB-AGENT TERMINAL" label + blinking activity indicator
- Each status line types in with `DossierLine` sub-component (20ms/char)
- Animated ASCII progress bar for rewriting phase (`ProgressBar` component)
- Auto-collapse to `[ ✓ CASE FILE: SLUG ]` badge 2.5s after completion
- Badge is clickable to expand

### ProjectNode: Three Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Skeleton** | `data.isLoading === true` | Shimmer blocks matching real layout (800px wide) |
| **Revealing** | `data.isRevealing === true` | Typewriter text + staggered fade-ins (see stagger table below) |
| **Static** | Neither flag set | Instant render, no animations |

The stagger multiplier `d = isRevealing ? 1 : 0` ensures non-dossier project cards render instantly.

#### Reveal Stagger Table

| Section | Delay (ms) | Animation |
|---------|------------|-----------|
| Header | 0 | TypewriterText (35ms/char) |
| Role | BASE × 2 | TypewriterText (30ms/char) |
| Hero Image | BASE × 3 | FadeIn + img opacity transition (700ms) |
| Metadata Table | BASE × 4 | FadeIn + TypewriterText per row |
| Content Paragraphs | BASE × (6+i) | TypewriterText (8ms/char per paragraph) |
| Tech Stack | BASE × (7+n) | FadeIn + scale pop per pill (100ms stagger) |
| Gallery | BASE × (8+n) | FadeIn + img opacity (300ms stagger per image) |
| Problem/Solution | BASE × (9+n) | FadeIn + TypewriterText (8ms/char) |
| Quote | BASE × (11+n) | FadeIn + TypewriterText (20ms/char) |

`BASE = 200ms`

### useTypewriter Hook

```typescript
useTypewriter(text: string, options?: {
  speed?: number;    // ms per character (default: 30)
  enabled?: boolean; // toggles effect (default: true)
  onComplete?: () => void;
}): { displayText, isComplete, cursorVisible }
```

Uses `setTimeout` for character reveal with blinking cursor state (500ms toggle).

## Files

### New Files
| File | Purpose |
|------|---------|
| `src/features/canvas/components/nodes/DossierNode.tsx` | Terminal-style progress node |
| `src/features/canvas/hooks/useTypewriter.ts` | Character-by-character text reveal hook |

### Modified Files
| File | Changes |
|------|---------|
| `src/app/api/chat/route.ts` | `createUIMessageStream` + `createUIMessageStreamResponse`, pass `writer` to sub-agent |
| `src/lib/ai/project-editor.ts` | Accept `UIMessageStreamWriter`, emit `data-dossier` events from tool executes |
| `src/features/canvas/store/nodeFactories.ts` | Add `createDossierNode`, `createSkeletonProjectNode` factories |
| `src/features/canvas/store/useCanvasStore.ts` | Dossier lifecycle state + `addDossier`, `updateDossierStatus`, `revealProject` actions |
| `src/features/editor-chat/hooks/useEditorialChat.ts` | `onData` handler routing dossier events; `revealProject` replaces `addProject` for dossier flow |
| `src/features/canvas/components/nodes/ProjectNode.tsx` | Skeleton mode (shimmer), revealing mode (typewriter), static mode |
| `src/features/canvas/components/EditorialCanvas.tsx` | Register `dossier` node type |
