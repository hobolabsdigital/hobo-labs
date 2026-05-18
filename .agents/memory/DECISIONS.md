# Architectural Decisions Log

> This file persists context across AI coding sessions. Read this FIRST before making changes.
> Append new decisions at the bottom. Never delete entries — mark superseded ones with ~~strikethrough~~.

---

## Project Identity

- **App**: Editorial portfolio — an AI-powered interactive canvas where visitors explore projects
- **Aesthetic**: Brutalist, Bauhaus-inspired. Raw typography, high contrast, deliberate imperfection
- **Stack**: Next.js (App Router) + ReactFlow + Framer Motion + Zustand + Vercel AI SDK
- **LLM**: Local Ollama — currently `gemma4:31b-cloud` (previously `deepseek-v4-pro:cloud`)
- **Theme system**: CSS variables with dark/light toggle. Three identities: default, Cyberpunk, Blueprint

## Architecture Overview

```
src/
├── app/                    # Next.js App Router
│   ├── api/chat/route.ts   # Main AI streaming endpoint (agent mode)
│   ├── api/project-data/   # Structured object streaming for ProjectNode
│   ├── api/suggestions/    # Dynamic prompt suggestions
│   └── api/project-context/# RAG context retrieval
├── core/                   # Shared UI, theme, utils
├── features/
│   ├── canvas/             # ReactFlow editorial canvas (main viewport)
│   │   ├── components/nodes/  # IntroNode, ProjectNode, TextNode, HeroNode, etc.
│   │   ├── store/useCanvasStore.ts  # Zustand — nodes, edges, physics
│   │   ├── store/nodeFactories.ts   # Node creation helpers
│   │   └── hooks/useEditorialPhysics.ts  # D3 force simulation
│   ├── editor-chat/        # Sidebar chat UI + streaming hook
│   ├── project-modal/      # Full-screen project expansion overlay
│   │   └── store/useProjectModalStore.ts
│   ├── entry/              # Intro animation sequence
│   ├── crt/                # Experimental CRT shader overlay
│   └── fluid-bg/           # WebGL fluid background
└── lib/
    ├── ai/config.ts        # Model configuration (Ollama)
    └── vectorStore.ts       # pgvector-based RAG
```

## Key Decisions

### D001 — StreamText + Output.object over StreamObject (2025-05-15)
**Context**: ProjectNode needs structured JSON (title, role, year, image, etc.) streamed from the LLM.
**Decision**: Use `streamText` with `Output.object()` instead of `streamObject`. The deprecated `streamObject` had reliability issues with local models.
**Rationale**: Modern Vercel AI SDK pattern. Better compatibility with Ollama. Reasoning/chain-of-thought disabled for structured data tasks to reduce TTFT.

### D002 — Flying Hero over layoutId for Modal Transitions (2025-05-16)
**Context**: Expanding a ProjectNode card into a full-screen modal needs a cinematic transition.
**Decision**: Manual coordinate-based "flying hero" animation instead of Framer Motion `layoutId`.
**Rationale**: `layoutId` broke inside ReactFlow's transformed coordinate space. The flying hero captures the source `getBoundingClientRect()`, stores it in `useProjectModalStore`, and animates an explicit `motion.img` from source to destination. Reverse-flight on close.
**Supersedes**: Three prior approaches — (1) layoutId, (2) WebGL shader displacement with html-to-image, (3) Three.js fold transition.

### D003 — D3 Force Physics with High Friction (2025-05-14)
**Context**: Nodes on the editorial canvas need organic, drifting layout.
**Decision**: D3 force simulation with `velocityDecay: 0.82` and soft directional forces.
**Rationale**: Lower friction caused rubber-banding. Higher friction prevents aggressive snapping while maintaining organic feel. Nodes flow L→R in a linear interaction hierarchy.

### D004 — Disable Chain-of-Thought for Structured Tasks (2025-05-15)
**Context**: Local LLM was slow to respond for project data generation.
**Decision**: `think: false` for structured data extraction, `think: true` only for conversational agent mode.
**Rationale**: CoT adds 2-5s latency for tasks that don't benefit from reasoning. Structured schema tasks just need fast JSON output.

### D005 — Gallery Deduplication via Word Intersection (2025-05-15)
**Context**: Hero image from ProjectNode was duplicating in the modal gallery slider.
**Decision**: Word-intersection heuristic to detect and remove duplicate hero images from gallery.
**Rationale**: URL comparison wasn't sufficient — same image could have different CDN paths. Fuzzy string matching on filenames/alt text was more reliable.

### D006 — CSS Variable Theming over Tailwind (ongoing)
**Context**: Project uses Tailwind but core aesthetic relies on CSS custom properties.
**Decision**: Design tokens live in CSS variables. Tailwind utilities used for layout, but colors/typography reference variables.
**Rationale**: Brutalist aesthetic requires precise control. Theme switching (dark/light/cyberpunk/blueprint) done via variable swapping on `:root`.

### D007 — SVG Timeline Scrubber with Dynamic viewBox (2025-05-13)
**Context**: Interactive timeline for node history on the canvas.
**Decision**: SVG-based scrubber with dynamic viewBox scaling. Expanded hit-boxes for drag interaction.
**Rationale**: CSS-based approaches had coordinate space distortion. SVG viewBox scales crisp at any viewport height.

### D008 — Prompt Suggestions as Solid Pills with mix-blend-difference (2025-05-12)
**Context**: Chat UI needs dynamic AI-generated prompt suggestions.
**Decision**: Horizontal scrollable pills with `mix-blend-difference` for color inversion. Fetched from `/api/suggestions` endpoint. Persistent queue of 3.
**Rationale**: Blend mode ensures readability against any background. Pills cycle as used — always 3 visible.

## User Preferences (Emile)

- Prefers **explicit, coordinate-based animations** over magic layout abstractions
- Values **empirical debugging** — evidence before fixes, never speculate
- Wants **brutalist, raw aesthetic** — not polished/corporate
- Dislikes optimistic agreement — "push back if my logic is flawed"
- Uses Ollama for local LLM inference — latency matters
- Monorepo with apps/portfolio as the main workspace
- Uses both this IDE (Antigravity) and Gemini CLI

### D009 — AABB Velocity-Based Collision over d3.forceCollide (2026-05-18)
**Context**: Nodes were overlapping after spawn; forceCollide wasn't resolving collisions between wide rectangular cards.
**Decision**: Custom `forceAABB` force modifying `vx/vy` (velocity), not `x/y` (position). Per-type bounding boxes from `NODE_DIMS` in `constants.ts`.
**Rationale**: D3 integrates velocity into position each tick — writing directly to `x/y` gets overwritten on the next integration step, causing snap-back. Velocity modifications persist through integration. Collision detection uses `x + vx` (predicted position) matching D3 internals.
**File**: `src/features/canvas/hooks/forceAABB.ts`

### D010 — Link Distance Cap to Prevent Off-Screen Drift (2026-05-18)
**Context**: Nodes were being pushed hundreds of px off-screen by the x-flow force because link strength (0.05) was too weak to oppose it.
**Decision**: `LINK_MAX_DISTANCE = 800` constant. Link force acts as a spring that becomes attractive once separation exceeds 800px. Strength bumped from 0.05 → 0.3.
**Rationale**: The link force must be strong enough to resist `x-flow` at max drift. The cap prevents runaway separation without clamping positions directly (which fights D3 integration).
**Files**: `src/features/canvas/constants.ts`, `src/features/canvas/hooks/useEditorialPhysics.ts`

### D011 — Hero Slot Image is a Measurement Anchor, Never Visible (2026-05-18)
**Context**: The hero slot `<img>` in `ProjectModalOverlay` was bleeding through behind the gallery slider when the slider translated off it.
**Decision**: `opacity: 0` always on the hero slot `<img>`. It exists only so `heroSlotRef.getBoundingClientRect()` gives the flying hero a landing coordinate.
**Rationale**: The flying hero (`motion.img`) provides the visual pre-settle. The slider provides it post-settle. The hero slot img is a structurally necessary but visually invisible element. Any opacity toggle tied to `currentIndex` races with the slider spring animation.
**File**: `src/features/project-modal/components/ProjectModalOverlay.tsx`
