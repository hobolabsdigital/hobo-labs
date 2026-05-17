import type { RAGChunk } from './types';

// Statically import the JSON files to support Vercel Edge Runtime
import personaDbRaw from '../../../docs/persona-vector-db.json';
import projectsDbRaw from '../../../docs/projects-vector-db.json';

export const personaDb = personaDbRaw as RAGChunk[];
export const projectsDb = projectsDbRaw as RAGChunk[];
