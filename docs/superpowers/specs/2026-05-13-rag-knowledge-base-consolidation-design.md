# Unified RAG Knowledge Base Consolidation

## Overview
Currently, the vector database embeddings are generated from two fragmented sources:
1. Hardcoded TypeScript arrays for persona facts (`scripts/ingest-persona.ts`).
2. Unstructured, inconsistent Markdown files for project case studies (`docs/projects/*.md`).

This creates a split-brain architecture where updating persona data requires editing source code, and project nodes struggle with schema extraction due to inconsistent `.md` formats. 

This design unifies all AI training data into a single, standardized "Knowledge Base" directory using the industry-standard **Hybrid (Frontmatter + Markdown)** approach.

## Objectives
1. **Schema Standardization:** Enforce a strict YAML Frontmatter block across all knowledge files (`docs/projects/` and `docs/persona/`) matching the AI's tool schema.
2. **Decoupled Knowledge:** Move all hardcoded persona facts out of `ingest-persona.ts` and into standalone `docs/persona/*.md` files.
3. **Unified Ingestion Pipeline:** Create a universal ingestion script (`scripts/ingest-knowledge.ts`) that traverses the knowledge base, parses the YAML + Markdown via `gray-matter`, generates embeddings, and outputs to the unified Vector DB.

## Architecture & Data Flow
- **Knowledge Files:** `.md` files acting as atomic units of context.
  - **Frontmatter (YAML):** Contains strict metadata (e.g., `category`, `type`, `topic` for persona; `year`, `role`, `techStack` for projects).
  - **Body (Markdown):** Contains the creative narrative and content (e.g., Overview, Problem, Solution).
- **Ingestion Script:** A Node script utilizing `gray-matter` to parse all files in `docs/projects` and `docs/persona`, embedding the concatenated `Frontmatter + Body` and saving to `docs/persona-vector-db.json`.

## Implementation Details
1. Install `gray-matter` to robustly parse YAML frontmatter.
2. Create `docs/persona/philosophy.md`, `docs/persona/technical-arsenal.md`, and `docs/persona/key-projects.md`.
3. Overhaul all 8 existing project `.md` files to adhere to the strict YAML template, generating creative filler for missing structured fields (Problem, Solution, Quote, etc.).
4. Rewrite `scripts/ingest-persona.ts` to `scripts/ingest-knowledge.ts` to dynamically glob and parse the `.md` directories.

## Trade-offs & Considerations
- **Content Hallucination:** Generating "filler" content for the projects ensures the AI has complete data to populate the `ProjectNode` schema. This filler can be edited by the user later without touching code.
- **Vector DB Naming:** The output file will remain `docs/persona-vector-db.json` to prevent breaking existing dependencies in `src/app/api/chat/route.ts`.
