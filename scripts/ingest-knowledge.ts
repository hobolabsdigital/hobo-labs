import { embedMany } from 'ai';
import { ollama } from 'ai-sdk-ollama';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

async function run() {
  console.log('Ingesting Knowledge Base...');

  const docsDir = path.join(process.cwd(), 'docs');
  const personaDir = path.join(docsDir, 'persona');
  const projectsDir = path.join(docsDir, 'projects');

  // =========================================================================
  // PERSONA DB: identity + skills + project catalog (lightweight, for main agent)
  // =========================================================================
  const personaChunks: Array<{ content: string; metadata: any }> = [];

  // Read persona markdown files
  const personaFiles = fs.readdirSync(personaDir).filter(f => f.endsWith('.md'));
  for (const file of personaFiles) {
    const filePath = path.join(personaDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: metadata, content: body } = matter(fileContent);

    const titleOrCat = metadata.title || metadata.category || file.replace('.md', '');
    const searchContent = `[${(metadata.type || 'persona').toUpperCase()}] ${titleOrCat}\n${body.trim()}`;

    personaChunks.push({
      content: searchContent,
      metadata: {
        ...metadata,
        source_file: filePath,
        type: metadata.type || 'persona',
      },
    });
  }

  // Embed persona DB
  const { embeddings: personaEmbeddings } = await embedMany({
    model: ollama.embedding('nomic-embed-text'),
    values: personaChunks.map((c) => c.content),
  });

  const personaDb = personaChunks.map((chunk, i) => ({
    ...chunk,
    embedding: personaEmbeddings[i],
  }));

  const personaDbPath = path.join(docsDir, 'persona-vector-db.json');
  fs.writeFileSync(personaDbPath, JSON.stringify(personaDb, null, 2));
  console.log(`Wrote ${personaDb.length} chunks to persona-vector-db.json`);

  // =========================================================================
  // PROJECTS DB: full case study detail (for sub-agent creative editing)
  // =========================================================================
  const projectChunks: Array<{ content: string; metadata: any }> = [];
  const projectFiles = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'));

  for (const file of projectFiles) {
    const filePath = path.join(projectsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: metadata, content: body } = matter(fileContent);

    const roleStr = metadata.role ? `Role: ${metadata.role}\n` : '';
    const yearStr = metadata.year ? `Year: ${metadata.year}\n` : '';
    const techStr = metadata.techStack
      ? `Tech Stack: ${metadata.techStack.join(', ')}\n`
      : '';
    const quoteStr = metadata.quote ? `Quote: "${metadata.quote}"\n` : '';

    const searchContent = `[PROJECT DETAIL] ${metadata.title}\n${roleStr}${yearStr}${techStr}${quoteStr}\n${body.trim()}`;

    projectChunks.push({
      content: searchContent,
      metadata: {
        ...metadata,
        source_file: filePath,
        type: 'project_detail',
        slug: file.replace('.md', ''),
      },
    });
  }

  // Embed projects DB
  const { embeddings: projectEmbeddings } = await embedMany({
    model: ollama.embedding('nomic-embed-text'),
    values: projectChunks.map((c) => c.content),
  });

  const projectsDb = projectChunks.map((chunk, i) => ({
    ...chunk,
    embedding: projectEmbeddings[i],
  }));

  const projectsDbPath = path.join(docsDir, 'projects-vector-db.json');
  fs.writeFileSync(projectsDbPath, JSON.stringify(projectsDb, null, 2));
  console.log(`Wrote ${projectsDb.length} chunks to projects-vector-db.json`);

  console.log('Done.');
}

run().catch(console.error);
