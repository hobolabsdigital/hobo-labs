import { findSimilarChunks } from './vectorStore';

jest.mock('ai', () => ({
  cosineSimilarity: jest.fn((a, b) => (a[0] === b[0] ? 1 : 0))
}));

test('findSimilarChunks returns top K items based on cosine similarity', () => {
  const queryEmbedding = [1, 0, 0];
  const db = [
    { content: 'Designer', metadata: { type: 'persona' }, embedding: [0, 1, 0] },
    { content: 'Developer', metadata: { type: 'persona' }, embedding: [1, 0, 0] }
  ];
  
  const results = findSimilarChunks(queryEmbedding, db, 1);
  expect(results.length).toBe(1);
  expect(results[0].content).toBe('Developer');
});
