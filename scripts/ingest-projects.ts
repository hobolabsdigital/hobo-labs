import { embedMany } from 'ai';
import { ollama } from 'ai-sdk-ollama';
import fs from 'fs';
import path from 'path';

async function run() {
  console.log('Ingesting Project Data...');
  
  const projectsDir = path.join(process.cwd(), 'docs', 'projects');
  const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'));
  
  let newChunks = [];

  for (const file of files) {
    const filePath = path.join(projectsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const projectId = file.replace('.md', '');
    
    // Extract title (first # Heading)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : projectId;
    
    // Chunking strategy: split by h2 headers (##)
    const sections = content.split(/^##\s+/m).filter(s => s.trim().length > 0);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      // If it's the first split and it has the # title, it's the intro. Otherwise it's a section.
      let chunkContent = section;
      let topic = i === 0 ? "Introduction" : section.split('\n')[0].trim();
      
      if (topic === 'AI Trigger Keyword') {
        continue;
      }
      
      newChunks.push({
        content: `Project: ${title}\nSection: ${topic}\n\n${chunkContent}`,
        metadata: {
          category: "Key Projects & Case Studies",
          type: "project_detail",
          topic: topic,
          projectId: projectId,
          title: title,
          image: `/portfolio/${projectId}.png`
        }
      });
    }
  }

  console.log(`Extracted ${newChunks.length} project chunks. Generating embeddings...`);

  const { embeddings } = await embedMany({
    model: ollama.embedding('nomic-embed-text'),
    values: newChunks.map(c => c.content),
  });

  const processedChunks = newChunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i]
  }));

  const dbPath = path.join(process.cwd(), 'docs', 'persona-vector-db.json');
  let existingDb = [];
  if (fs.existsSync(dbPath)) {
    existingDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    // Optionally filter out old project chunks if re-running
    existingDb = existingDb.filter((c: any) => c.metadata.type !== 'project_detail');
  }

  const finalDb = [...existingDb, ...processedChunks];
  
  fs.writeFileSync(dbPath, JSON.stringify(finalDb, null, 2));
  console.log(`Appended ${processedChunks.length} project chunks. Total chunks: ${finalDb.length}. Wrote to ${dbPath}`);
}

run().catch(console.error);
