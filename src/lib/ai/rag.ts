import { ollama } from 'ai-sdk-ollama';
import { embed } from 'ai';
import { findSimilarChunks } from '@/lib/vectorStore';
import { RAGChunk } from './types';

// Statically import the JSON files to support Vercel Edge Runtime
import personaDbRaw from '../../../docs/persona-vector-db.json';
import projectsDbRaw from '../../../docs/projects-vector-db.json';

const personaDb = personaDbRaw as RAGChunk[];
const projectsDb = projectsDbRaw as RAGChunk[];

const PROJECT_CATALOG_CONTENT = `
## AVAILABLE PROJECTS
Use the exact slug when calling showProject.

- Editorial Canvas Portfolio | 2026 | Chief Creative Technologist | slug: "editorial-canvas"
- RISE ePA+ (Electronic Patient Record) | 2023 | iOS Developer | slug: "epa"
- Find My Mazda | 2022 | Lead Developer | slug: "find-my-mazda"
- Hermes | 2024 | Lead Architect | slug: "hermes"
- MonstoryX | 2025 | Chief Creative Technologist | slug: "monstory"
- Moxis (XiTrust) | 2024 | Lead Architecture & Engineering | slug: "moxis"
- My Mazda App | 2021 | Lead Developer | slug: "my-mazda"
- Wagner BIG CITY Pizza (Nestlé) | 2020 | AR Experience Developer | slug: "nestle-wagner"
- StopOverfishing (Oceana) | 2019 | Web Developer & Creative Technologist | slug: "oceana"
- Woozle Goozle App (Super RTL) | 2018 | Lead Developer | slug: "woozle-goozle"
`.trim();

/**
 * Retrieve persona context via hybrid search (vector similarity + keyword fallback).
 */
export async function retrievePersonaContext(userQuery: string): Promise<string> {
  if (!userQuery) return '';

  try {
    const combinedDb: RAGChunk[] = [...personaDb, ...projectsDb];
    if (combinedDb.length === 0) return '';

    // Vector similarity search
    const { embedding } = await embed({
      model: ollama.embedding('nomic-embed-text'),
      value: userQuery,
    });
    const topChunks = findSimilarChunks(embedding, combinedDb, 5);

    // Keyword fallback for terms the embedding model might miss
    const queryTerms = userQuery.toLowerCase().split(' ').filter(t => t.length > 3);
    const keywordChunks = combinedDb
      .filter((c: RAGChunk) => {
        const content = c.content.toLowerCase();
        return queryTerms.some(term => content.includes(term));
      })
      .slice(0, 3);

    // Deduplicate by content
    const combined = [...topChunks, ...keywordChunks];
    const unique = Array.from(
      new Set(combined.map(c => JSON.stringify(c)))
    ).map(str => JSON.parse(str as string) as RAGChunk);

    return unique.map(c => c.content).join('\n\n---\n\n');
  } catch (e) {
    console.error('RAG retrieval error:', e);
    return '';
  }
}

/**
 * Load the project catalog markdown (used deterministically in the system prompt).
 */
export function loadProjectCatalog(): string {
  return PROJECT_CATALOG_CONTENT;
}
