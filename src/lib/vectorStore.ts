import { cosineSimilarity } from 'ai';
import type { RAGChunk } from '@/lib/ai/types';

/** @deprecated Use RAGChunk instead — kept as alias for backwards compatibility */
export type Chunk = RAGChunk;

export function findSimilarChunks(queryEmbedding: number[], chunks: RAGChunk[], topK: number = 3): RAGChunk[] {
  const scored = chunks.map(chunk => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => s.chunk);
}
