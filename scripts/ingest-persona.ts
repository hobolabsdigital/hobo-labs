import { embedMany } from 'ai';
import { ollama } from 'ai-sdk-ollama';
import fs from 'fs';
import path from 'path';

async function run() {
  console.log('Ingesting Persona Data...');
  // For Phase 1, we ingest a simple array of core facts about Emile.
  const chunks = [
    { content: "Emile Harmel is a Designer & Developer based in [City].", metadata: { type: "persona" } },
    { content: "Emile's process involves Brainstorming, Prototyping, and Building.", metadata: { type: "process" } },
    { content: "Emile has 10+ years of experience blending Brutalist aesthetics with modern web technologies.", metadata: { type: "experience" } }
  ];

  const { embeddings } = await embedMany({
    model: ollama.embedding('nomic-embed-text'),
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
