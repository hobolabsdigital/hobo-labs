import { ollama } from 'ai-sdk-ollama';
import { embed } from 'ai';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { findSimilarChunks } from '@/lib/vectorStore';

/**
 * Retrieve persona context via hybrid search (vector similarity + keyword fallback).
 * Returns an empty string if the persona DB doesn't exist or retrieval fails.
 */
export async function retrievePersonaContext(userQuery: string): Promise<string> {
  if (!userQuery) return '';

  try {
    const personaDbPath = path.join(process.cwd(), 'docs', 'persona-vector-db.json');
    const projectsDbPath = path.join(process.cwd(), 'docs', 'projects-vector-db.json');
    
    let combinedDb: any[] = [];

    if (fs.existsSync(personaDbPath)) {
      const personaDb = JSON.parse(fs.readFileSync(personaDbPath, 'utf8'));
      combinedDb.push(...personaDb);
    } else {
      console.warn('RAG: Persona DB not found at', personaDbPath);
    }

    if (fs.existsSync(projectsDbPath)) {
      const projectsDb = JSON.parse(fs.readFileSync(projectsDbPath, 'utf8'));
      combinedDb.push(...projectsDb);
    } else {
      console.warn('RAG: Projects DB not found at', projectsDbPath);
    }

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
      .filter((c: any) => {
        const content = c.content.toLowerCase();
        return queryTerms.some(term => content.includes(term));
      })
      .slice(0, 3);

    // Deduplicate by content
    const combined = [...topChunks, ...keywordChunks];
    const unique = Array.from(
      new Set(combined.map(c => JSON.stringify(c)))
    ).map(str => JSON.parse(str as string));

    return unique.map((c: any) => c.content).join('\n\n---\n\n');
  } catch (e) {
    console.error('RAG retrieval error:', e);
    return '';
  }
}

/**
 * Load the project catalog markdown (used deterministically in the system prompt).
 * Returns empty string on failure.
 */
export function loadProjectCatalog(): string {
  try {
    const catalogPath = path.join(process.cwd(), 'docs', 'persona', 'project-catalog.md');
    if (!fs.existsSync(catalogPath)) return '';

    const raw = fs.readFileSync(catalogPath, 'utf8');
    const { content } = matter(raw);
    return content.trim();
  } catch (e) {
    console.error('Failed to load project catalog:', e);
    return '';
  }
}
