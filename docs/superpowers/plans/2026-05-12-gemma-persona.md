# Gemma Embeddings & Editorial Persona Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the AI's intelligence and contextual awareness within the editorial canvas by implementing Gemma-based embeddings for semantic knowledge retrieval and establishing a strict, cohesive persona for the Ollama model. This ensures responses align with the brutalist, experimental aesthetic of the portfolio.

---

### Task 1: Vector Storage & Embedding Pipeline

We will introduce a pipeline to generate and store embeddings for the portfolio's content.

**Files:**
- Create: `apps/portfolio/src/lib/embeddings.ts`
- Create: `apps/portfolio/src/lib/vectorStore.ts`

- [ ] **Step 1: Setup Vector Database**
Determine the storage mechanism. For a local, portfolio-scale application, a lightweight local database like `ChromaDB`, `SQLite` (via `sqlite-vss`), or even a simple in-memory store (`hnswlib-node` / JSON file) is required.
- [ ] **Step 2: Write Vector Store Abstraction**
Implement `src/lib/vectorStore.ts` to provide a clean abstraction layer for adding documents and performing semantic search/similarity matching against user queries.
- [ ] **Step 3: Write Embedding Utilities**
Implement `src/lib/embeddings.ts` with utility functions to interface with the Ollama API to generate embeddings using the Gemma model. Add functions to chunk text content and store vectors in the database.

---

### Task 2: System Persona & API Routing

We will overhaul the chat API to inject context retrieved from the vector store and enforce the new persona.

**Files:**
- Modify: `apps/portfolio/src/app/api/chat/route.ts`

- [ ] **Step 1: Define Editorial Persona**
Determine the specific persona. Does the model act specifically as Emile (the creator), an AI co-pilot, or an abstract "Creative Engine"?
- [ ] **Step 2: Update System Prompt**
Update the system prompt in `api/chat/route.ts` to enforce the new strict "Editorial Persona" so it doesn't break character or hallucinate.
- [ ] **Step 3: Integrate RAG Step**
Before passing the user's message to the model, query the vector store, retrieve relevant context, and inject it into the prompt. Maintain the existing intent routing (`show_work`, `show_process`) while enriching the conversational responses with retrieved facts.

---

### Open Questions for Next Session
1. **Database Selection:** Which vector storage approach do we prefer? (In-memory, ChromaDB, SQLite?)
2. **Embedding Source:** What exact content will we be embedding? (Past projects, blog posts, personal resume/history?)
3. **Gemma Model Pipeline:** Are we using a local Gemma instance via Ollama for generating embeddings (`ollama run gemma`), or an external API?
4. **Persona Definition:** What exactly is the persona? (e.g., Emile, an abstract AI, a brutalist design engine).
