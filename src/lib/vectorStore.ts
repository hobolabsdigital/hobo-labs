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
