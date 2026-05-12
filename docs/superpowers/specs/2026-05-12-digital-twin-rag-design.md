# Digital Twin RAG & Agentic Portfolio Design

## 1. Purpose & Goals
The goal is to transform the editorial canvas into an interactive "Digital Twin" of Emile. The portfolio will serve as a showcase of Retrieval-Augmented Generation (RAG). The AI will adopt Emile's persona and use semantic search to retrieve information from a local knowledge base (CV and Project Markdown files). It will respond not just with text, but by orchestrating multiple specialized UI nodes (Projects, Case Studies, Hero blocks) and auto-generating context-aware follow-up prompts.

## 2. Architecture & Data Flow

### 2.1 Embedding & Knowledge Base Pipeline (Pre-compute)
- **Data Sources:** Parse `docs/Emile_Harmel.pdf` (CV, services, persona) and `docs/projects/*.md` (Project specifics).
- **Chunking Strategy:** Content will be categorized and chunked into structural entities: *Persona*, *Services*, *Projects*, and *Case Studies*.
- **Vector Storage:** We will utilize a local vector store (e.g., `hnswlib-node` or a JSON-backed vector array) to keep the application portable and self-contained. Embeddings will be generated via an embedding model (e.g., OpenAI or Ollama).

### 2.2 Semantic Retrieval & Digital Twin Persona (Runtime)
- **Query Interception:** When a user types a message, the backend first embeds the query and performs a similarity search against the local vector store.
- **Context Injection:** The top relevant chunks (e.g., the specific project they asked about, or the list of services) are injected directly into the Vercel AI SDK system prompt.
- **Persona Enforcement:** The system prompt instructs the AI to speak in the first person as Emile, utilizing the injected context to maintain accuracy and prevent hallucinations.

### 2.3 Agentic Tool Execution & Canvas Spawning
The AI will act as a spatial orchestrator, calling specific tools to render data on the canvas. The `useEditorialChat` hook will intercept these calls and spawn nodes via `useCanvasStore` and the existing `nodeFactories`.

**Available Tools (Expanding our existing arsenal):**
1. `spawnTextNode(text)`: **(Existing)** Streams conversational text responses directly onto the canvas.
2. `spawnHeroNode(headline, subline, layoutIntent)`: **(Existing)** Spawns large, brutalist typographic headers for high-impact statements. 
3. `spawnProjectNode(projectId, summary)`: **(New)** Spawns a dedicated UI layout for a portfolio piece, fetching image assets and metadata.
4. `spawnCaseStudyNode(caseStudyId, highlights)`: **(New)** Spawns an in-depth case study layout with scrollable content.
5. `generateFollowUpPrompts(prompts[])`: **(New)** Spawns interactive buttons (similar to the existing quick prompts) linked to the active response.

*Note: The AI can call multiple tools simultaneously in a single turn. For example, it can answer a question using the existing `TextNode`, spawn a `HeroNode` for emphasis, and drop a new `ProjectNode` into the viewport.*

## 3. Component & Interface Boundaries
- **Backend (`src/app/api/chat/route.ts`)**: Handles the RAG search, context assembly, and Vercel AI SDK streaming.
- **Vector Lib (`src/lib/vectorStore.ts`)**: Encapsulates the local embedding generation and similarity search logic.
- **Frontend (`src/features/editor-chat/hooks/useEditorialChat.ts`)**: Parses the `onToolCall` events from the AI stream and dispatches node creation events to the canvas store.
- **Node Components (`src/features/canvas/components/nodes/`)**: Specialized ReactFlow node components designed specifically for Projects, Case Studies, and Services.

## 4. Error Handling & Constraints
- **Hallucination Prevention:** The AI will be strictly instructed to only spawn project nodes for IDs that exist in the injected context.
- **Empty Retrieval:** If the semantic search yields low confidence scores, the AI will gracefully fall back to a generic "Digital Twin" greeting and suggest looking at the main project list.
