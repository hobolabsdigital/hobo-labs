# AI Architecture: Sub-Agent & Vector DB Implementation

## Overview

The portfolio uses a two-tier AI agent architecture: a conversational **main agent** handles chat flow and intent, while a **sub-agent** handles creative project card generation. Knowledge is split across two vector databases to keep the main agent's context lean and focused.

A **data stream layer** (`createUIMessageStream`) allows the server to push real-time progress events to the client during sub-agent execution, powering the [CIA Dossier Reveal](./superpowers/specs/2026-05-14-dossier-reveal-design.md) feedback system.

## Architecture Diagram

```
User: "tell me about MonstoryX"
  │
  ├─ RAG: queries persona-vector-db.json (3 chunks)
  │     → identity, skills, project catalog
  │
  ├─ System Prompt: always includes project-catalog.md
  │     (not dependent on RAG retrieval)
  │
  ├─ createUIMessageStream({ execute: async ({ writer }) => { ... } })
  │     │
  │     ├─ Main Agent (gemma4 via streamText)
  │     │     Sees: persona context + project catalog
  │     │     Calls: showProject(slug: "monstory")  ← single string, not 12 fields
  │     │
  │     └─ showProject.execute():
  │          │
  │          ├─ writer.write({ type: 'data-dossier', data: { status: 'accessing', slug } })
  │          │     → Client spawns DossierNode + skeleton ProjectNode
  │          │
  │          └─ Sub-Agent (gemma4 via ToolLoopAgent)
  │               │  Isolated context window, independent model instance
  │               │  Has access to UIMessageStreamWriter for progress events
  │               │
  │               ├─ Calls: getProjectSource("monstory")
  │               │     → loads full case study from projects-vector-db.json
  │               │     → emits data-dossier { status: 'source-loaded', title }
  │               │
  │               ├─ Studies raw data, writes creative editorial content
  │               │
  │               └─ Calls: submitProjectCard({ title, summary, content, ... })
  │                     → Zod-validated, stored in shared variable
  │                     → emits data-dossier { status: 'complete' }
  │                     → Returned to main agent's tool result
  │                     → Client calls revealProject() to fill skeleton
  │
  └─ writer.merge(result.toUIMessageStream({ sendReasoning: true }))
        → LLM text/reasoning/tool streams merge into the custom stream
```

## Streaming Architecture

### Why `createUIMessageStream` over `toUIMessageStreamResponse`

The original `result.toUIMessageStreamResponse()` only streams standard LLM events (text, reasoning, tool calls). It provides no mechanism for custom progress annotations during long-running tool executions.

`createUIMessageStream` creates a writable stream where we:
1. **Interleave custom `data-dossier` events** during the sub-agent's ~5-second execution
2. **Merge the LLM output** via `writer.merge(result.toUIMessageStream())` so text, reasoning, and tool calls still flow normally

This eliminates the "dead zone" — the client receives progress updates throughout the sub-agent's work.

### Stream Event Flow

```
Server                                    Client (onData callback)
──────                                    ──────────────────────────
writer.write(data-dossier: accessing)  →  addDossier(slug)
  │                                         → spawn DossierNode
  │                                         → spawn skeleton ProjectNode
  │
writer.write(data-dossier: source-loaded) → updateDossierStatus('source-loaded')
  │                                         → DossierNode shows "SOURCE DATA LOADED ✓"
  │
writer.write(data-dossier: rewriting)    → updateDossierStatus('rewriting')
  │                                         → DossierNode shows progress bar
  │
writer.write(data-dossier: complete)     → updateDossierStatus('complete')
  │                                         → DossierNode shows "DOSSIER COMPLETE"
  │
tool-output-available (project data)     → revealProject(data)
                                            → skeleton fills with real data
                                            → typewriter reveal animations
                                            → DossierNode auto-collapses (2.5s)
```

## Why Two Vector Databases

| Database | Contents | Size | Consumer |
|----------|----------|------|----------|
| `persona-vector-db.json` | philosophy.md, technical-arsenal.md, project-catalog.md | 3 chunks | Main agent |
| `projects-vector-db.json` | 10 project case studies with full bodies | 10 chunks | Sub-agent only |

**Before**: single DB with 12+ chunks, all dumped into the main agent's system prompt. Project bodies (several hundred words each) bloated the context window. Gemma4 struggled to process it all and frequently dropped fields from the 12-field `createProjectNode` schema.

**After**: the main agent gets 3 lightweight chunks (identity + catalog). Project bodies are only loaded when the sub-agent explicitly requests them via `getProjectSource`.

## Project Catalog

The catalog lives at `docs/persona/project-catalog.md` and is **always included** in the main agent's system prompt — it does not depend on RAG retrieval. This guarantees the main agent always knows which projects exist and their exact slugs.

The catalog is also embedded in `persona-vector-db.json` so it can be retrieved by semantic search when the user's query relates to "available projects."

## Sub-Agent Implementation

The sub-agent is a `ToolLoopAgent` from the Vercel AI SDK (`ai` package v6). It receives a `UIMessageStreamWriter` reference from the route so it can emit progress events during execution.

### Tools

**`getProjectSource(slug)`** — Loads raw project data from the projects vector DB. Matches by slug, with fallback to title-based slug matching. Emits `data-dossier { status: 'source-loaded' }` on success.

**`submitProjectCard(fields)`** — Submits the finished project card. Input is validated by a Zod schema with all 12 fields (`title`, `summary`, `content`, `techStack`, `role`, `year`, `image`, `gallery`, `problem`, `solution`, `quote`). Emits `data-dossier { status: 'complete' }` on success.

### Isolation

Each sub-agent invocation starts with a fresh context window. It does not see the main agent's conversation history, voice/tone rules, or any other context. This focused isolation means gemma4 can dedicate its full attention to the creative editing task.

### Creative Brief

The sub-agent's instructions are exclusively about creative editorial writing:
- Bauhaus-style, architecturally precise prose
- Magazine-quality sub-headlines
- 2-3 substantial paragraphs for the content field
- Faithful to project facts with added creative flair

## Key Files

### API & AI Pipeline

| File | Role |
|------|------|
| `src/app/api/chat/route.ts` | Main API route — `createUIMessageStream`, tool defs, stream merging |
| `src/lib/ai/config.ts` | Model configuration (Ollama/gemma4) |
| `src/lib/ai/prompts.ts` | System prompt builder |
| `src/lib/ai/rag.ts` | RAG context retrieval + project catalog loading |
| `src/lib/ai/tools.ts` | `createHeroNode` tool definition |
| `src/lib/ai/project-editor.ts` | Sub-agent factory with `UIMessageStreamWriter` integration |
| `src/lib/ai/messages.ts` | User query extraction |
| `src/lib/ai/mock-stream.ts` | Mock stream for dev/testing |

### Canvas & Node System

| File | Role |
|------|------|
| `src/features/canvas/store/useCanvasStore.ts` | Zustand store — nodes, edges, dossier lifecycle state |
| `src/features/canvas/store/nodeFactories.ts` | Node creation factories (hero, text, project, ghost, dossier, skeleton) |
| `src/features/canvas/components/EditorialCanvas.tsx` | ReactFlow canvas with registered node types |
| `src/features/canvas/components/nodes/ProjectNode.tsx` | Three-mode project card (skeleton, revealing, static) |
| `src/features/canvas/components/nodes/DossierNode.tsx` | CIA terminal-style sub-agent progress node |
| `src/features/canvas/components/nodes/GhostNode.tsx` | Reasoning/thinking state node |
| `src/features/canvas/components/nodes/HeroNode.tsx` | Large hero text node |
| `src/features/canvas/components/nodes/TextNode.tsx` | Body text node |
| `src/features/canvas/hooks/useTypewriter.ts` | MS-DOS character reveal hook |

### Chat Integration

| File | Role |
|------|------|
| `src/features/editor-chat/hooks/useEditorialChat.ts` | Chat hook — `onData` handler, tool call routing, `revealProject` |

### Knowledge Bases

| File | Role |
|------|------|
| `scripts/ingest-knowledge.ts` | Generates both vector DBs from markdown files |
| `docs/persona/project-catalog.md` | Static project listing, always in system prompt |
| `docs/persona-vector-db.json` | Persona embeddings (3 chunks) |
| `docs/projects-vector-db.json` | Project detail embeddings (10 chunks) |
| `src/lib/vectorStore.ts` | Cosine similarity search utility |

## Client-Side Tool Handling

The `showProject` tool is server-executed — its `execute` function runs the sub-agent. The result arrives via the stream.

### Dual Handling Paths

1. **`onToolCall`** — fires when the tool call is received; checks for a synchronously available result (fast path). If the dossier system is active, calls `revealProject()` to fill the existing skeleton node.
2. **`useEffect` on messages** — watches for `tool-showProject` parts with `state: 'output-available'`, calls `revealProject()` when the result arrives (async path).

A `processedShowProjectCalls` ref prevents duplicate node creation on re-renders.

### Dossier-Aware Flow

When the dossier system is active, `revealProject(data)` replaces the old `addProject(data, id)` pattern:
- `addProject` creates a **new** ProjectNode from scratch
- `revealProject` **updates** the existing skeleton ProjectNode's data, triggering typewriter animations

## Running

```bash
# Regenerate vector DBs after editing markdown files
cd apps/portfolio
npx tsx scripts/ingest-knowledge.ts

# Start dev server
npm run dev
```

## Design Decisions

- **`createUIMessageStream` over `toUIMessageStreamResponse`**: allows interleaving custom data events alongside standard LLM output during long-running tool executions. Essential for the dossier feedback system.
- **`UIMessageStreamWriter` threaded into sub-agent**: the writer reference flows from route → `createProjectEditor(writer)` → tool `execute` functions. This keeps event emission co-located with the data it describes.
- **ToolLoopAgent over raw generateText**: gives the sub-agent its own tools and follows the AI SDK's intended sub-agent pattern. The `getProjectSource` tool keeps data loading inside the agent loop rather than dumping it in the prompt.
- **Zod schema tool over JSON parsing**: `submitProjectCard` validates output at generation time. The model is guided by the Zod schema structure. No regex or `JSON.parse` fragility.
- **Separate DBs over single DB**: keeps the main agent's context lean. The project catalog bridges the two — the main agent knows what exists, the sub-agent loads the details.
- **Catalog always in prompt over RAG-only**: RAG retrieval is probabilistic. The catalog must be deterministic.
- **Skeleton + reveal over loading spinner**: maintains layout stability and delivers a high-impact, professional data-loading experience. The skeleton reserves space so the canvas doesn't reflow when data arrives.
