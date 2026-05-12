# Digital Twin RAG: Phase 1 (Persona & Experience)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the foundation of the Digital Twin RAG. We will focus purely on giving the AI knowledge of Emile's persona and general experience. It will answer queries using the existing `TextNode` and `HeroNode` components to verify that the persona injection works before we tackle projects and case studies.

**Architecture:** A lightweight script will chunk your core persona details into a local JSON vector database using the Vercel AI SDK `embed` function. The `src/app/api/chat/route.ts` will perform cosine similarity search on user queries, inject the relevant persona chunks into the system prompt, and stream the response to the canvas.

**Tech Stack:** Next.js, Vercel AI SDK, Ollama (or equivalent configured provider).

---

### Task 1: Vector Store Utilities

**Files:**
- Create: `src/lib/vectorStore.ts`
- Create: `src/lib/vectorStore.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/vectorStore.test.ts
import { findSimilarChunks } from './vectorStore';

jest.mock('ai', () => ({
  cosineSimilarity: jest.fn((a, b) => (a[0] === b[0] ? 1 : 0))
}));

test('findSimilarChunks returns top K items based on cosine similarity', () => {
  const queryEmbedding = [1, 0, 0];
  const db = [
    { content: 'Designer', embedding: [0, 1, 0] },
    { content: 'Developer', embedding: [1, 0, 0] }
  ];
  
  const results = findSimilarChunks(queryEmbedding, db, 1);
  expect(results.length).toBe(1);
  expect(results[0].content).toBe('Developer');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/vectorStore.test.ts`
Expected: FAIL with "findSimilarChunks is not defined"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/lib/vectorStore.ts
import { cosineSimilarity } from 'ai';

export interface Chunk {
  content: string;
  metadata: Record<string, any>;
  embedding: number[];
}

export function findSimilarChunks(queryEmbedding: number[], chunks: Chunk[], topK: number = 3): Chunk[] {
  const scored = chunks.map(chunk => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => s.chunk);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/vectorStore.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/vectorStore.ts src/lib/vectorStore.test.ts
git commit -m "feat(rag): add local cosine similarity search utility"
```

---

### Task 2: Persona Ingestion Script

**Files:**
- Create: `scripts/ingest-persona.ts`
- Create (generated): `docs/persona-vector-db.json`

- [ ] **Step 1: Create the ingestion script**
This script will parse your core persona file and generate embeddings.

```typescript
// scripts/ingest-persona.ts
import { embedMany } from 'ai';
import { ollama } from 'ai-sdk-ollama'; // Or whichever model provider you use locally
import fs from 'fs';
import path from 'path';

async function run() {
  console.log('Ingesting Persona Data...');
  // For Phase 1, we ingest a simple array of core facts about Emile.
  // In later phases, this parses the markdown files.
  const chunks = [
    { content: "Emile Harmel is a Designer & Developer based in [City].", metadata: { type: "persona" } },
    { content: "Emile's process involves Brainstorming, Prototyping, and Building.", metadata: { type: "process" } },
    { content: "Emile has 10+ years of experience blending Brutalist aesthetics with modern web technologies.", metadata: { type: "experience" } }
  ];

  const { embeddings } = await embedMany({
    model: ollama.embedding('nomic-embed-text'), // Assuming local nomic embeddings
    values: chunks.map(c => c.content),
  });

  const db = chunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i]
  }));

  const dbPath = path.join(process.cwd(), 'docs', 'persona-vector-db.json');
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log(`Wrote ${db.length} chunks to ${dbPath}`);
}

run().catch(console.error);
```

- [ ] **Step 2: Run the script to generate the DB**

Run: `npx tsx scripts/ingest-persona.ts`
Expected: Output showing successful creation of `docs/persona-vector-db.json`.

- [ ] **Step 3: Commit**

```bash
git add scripts/ingest-persona.ts
git commit -m "script: add persona ingestion script for basic RAG setup"
```

---

### Task 3: Chat API with Persona RAG

**Files:**
- Modify: `src/app/api/chat/route.ts`

- [ ] **Step 1: Update API Route**
Load the vector database, embed the user's query, and inject context into the system prompt.

```typescript
// src/app/api/chat/route.ts
import { streamText, embed } from 'ai';
import { ollama } from 'ai-sdk-ollama';
import { findSimilarChunks, Chunk } from '@/lib/vectorStore';
import fs from 'fs';
import path from 'path';

// Note: Pre-load this JSON to memory for performance
let dbCache: Chunk[] | null = null;
function getDB() {
  if (!dbCache) {
    try {
      const dbPath = path.join(process.cwd(), 'docs', 'persona-vector-db.json');
      const data = fs.readFileSync(dbPath, 'utf8');
      dbCache = JSON.parse(data) as Chunk[];
    } catch (e) {
      dbCache = [];
    }
  }
  return dbCache;
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  // 1. Embed user query to find relevant context
  const { embedding } = await embed({
    model: ollama.embedding('nomic-embed-text'),
    value: lastMessage.content,
  });

  // 2. Retrieve Context
  const chunks = getDB();
  const topChunks = chunks.length > 0 ? findSimilarChunks(embedding, chunks, 2) : [];
  const contextText = topChunks.map(c => c.content).join('\n\n');

  // 3. Define System Prompt
  const systemPrompt = `You are the Digital Twin of Emile Harmel, a Designer & Developer.
  Speak in the first person ("I"). Use the following facts about yourself to answer the user's questions accurately.
  Do NOT invent experiences outside of this context.
  
  My Context/Facts:
  ${contextText}
  `;

  // 4. Stream response using existing AI SDK setup
  const result = await streamText({
    model: ollama('gemma'),
    system: systemPrompt,
    messages,
    // Note: Tools (spawnProjectNode, etc.) are removed for Phase 1. 
    // We rely solely on the default TextNode/HeroNode spawning for now.
  });

  return result.toDataStreamResponse();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat(rag): inject semantic persona context into chat prompt"
```

---

### Phase 1 Verification

1. Start the dev server (`npm run dev`).
2. Open the browser and ask the Editorial AI canvas: "What is your process?" or "Who are you?".
3. Ensure the AI responds strictly using the context injected from `docs/persona-vector-db.json` and streams correctly into the existing TextNode on the canvas.
