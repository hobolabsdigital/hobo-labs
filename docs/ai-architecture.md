# AI Architecture: Sub-Agent & Vector DB Implementation

## Overview

The portfolio uses a two-tier AI agent architecture: a conversational **main agent** handles chat flow and intent, while a **sub-agent** handles creative project card generation. Knowledge is split across two vector databases to keep the main agent's context lean and focused.

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
  ├─ Main Agent (gemma4 via streamText)
  │     Sees: persona context + project catalog
  │     Calls: showProject(slug: "monstory")  ← single string, not 12 fields
  │
  └─ showProject.execute():
       │
       └─ Sub-Agent (gemma4 via ToolLoopAgent)
            │  Isolated context window, independent model instance
            │  Instructions: creative editor brief only
            │
            ├─ Calls: getProjectSource("monstory")
            │     → loads full case study from projects-vector-db.json
            │
            ├─ Studies raw data, writes creative editorial content
            │
            └─ Calls: submitProjectCard({ title, summary, content, ... })
                  → Zod-validated, stored in shared variable
                  → Returned to main agent's tool result
                  → Client renders ProjectNode on canvas
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

The sub-agent is a `ToolLoopAgent` from the Vercel AI SDK (`ai` package v6). It has:

### Tools

**`getProjectSource(slug)`** — Loads raw project data from the projects vector DB. Matches by slug, with fallback to title-based slug matching.

**`submitProjectCard(fields)`** — Submits the finished project card. Input is validated by a Zod schema with all 12 fields (`title`, `summary`, `content`, `techStack`, `role`, `year`, `image`, `gallery`, `problem`, `solution`, `quote`). The `execute` function stores the validated data in a shared variable. No JSON parsing, no regex extraction.

### Isolation

Each sub-agent invocation starts with a fresh context window. It does not see the main agent's conversation history, voice/tone rules, or any other context. This focused isolation means gemma4 can dedicate its full attention to the creative editing task.

### Creative Brief

The sub-agent's instructions are exclusively about creative editorial writing:
- Bauhaus-style, architecturally precise prose
- Magazine-quality sub-headlines
- 2-3 substantial paragraphs for the content field
- Faithful to project facts with added creative flair

## Key Files

| File | Role |
|------|------|
| `scripts/ingest-knowledge.ts` | Generates both vector DBs from markdown files |
| `docs/persona/project-catalog.md` | Static project listing, always in system prompt |
| `docs/persona-vector-db.json` | Persona embeddings (3 chunks) |
| `docs/projects-vector-db.json` | Project detail embeddings (10 chunks) |
| `src/app/api/chat/route.ts` | Main API route — RAG, agents, streaming |
| `src/features/editor-chat/hooks/useEditorialChat.ts` | Client-side tool call handling |
| `src/features/canvas/store/nodeFactories.ts` | Node creation from tool result data |
| `src/features/canvas/components/nodes/ProjectNode.tsx` | Project card renderer |
| `src/lib/vectorStore.ts` | Cosine similarity search utility |

## Client-Side Tool Handling

The `showProject` tool is server-executed — its `execute` function runs the sub-agent. The client's `onToolCall` callback fires when the tool call is received, but the result arrives later via the stream.

Two mechanisms handle this:

1. **`onToolCall`** — checks for a synchronously available result (fast path)
2. **`useEffect` on messages** — watches for `tool-showProject` parts with `state: 'output-available'`, creates the node when the result arrives (async path)

A `processedShowProjectCalls` ref prevents duplicate node creation on re-renders.

## Running

```bash
# Regenerate vector DBs after editing markdown files
cd apps/portfolio
npx tsx scripts/ingest-knowledge.ts

# Start dev server
npm run dev
```

## Design Decisions

- **ToolLoopAgent over raw generateText**: gives the sub-agent its own tools and follows the AI SDK's intended sub-agent pattern. The `getProjectSource` tool keeps data loading inside the agent loop rather than dumping it in the prompt.
- **Zod schema tool over JSON parsing**: `submitProjectCard` validates output at generation time. The model is guided by the Zod schema structure. No regex or `JSON.parse` fragility.
- **Separate DBs over single DB**: keeps the main agent's context lean. The project catalog bridges the two — the main agent knows what exists, the sub-agent loads the details.
- **Catalog always in prompt over RAG-only**: RAG retrieval is probabilistic. The catalog must be deterministic.
