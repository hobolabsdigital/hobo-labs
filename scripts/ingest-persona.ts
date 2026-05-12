import { embedMany } from 'ai';
import { ollama } from 'ai-sdk-ollama';
import fs from 'fs';
import path from 'path';

async function run() {
  console.log('Ingesting Persona Data...');
  // For Phase 1, we ingest a simple array of core facts about Emile.
  const chunks = [
    // Persona & Philosophy
    { content: "Emile Harmel is a Chief Creative Technologist, Systems Architect, and Founder based in Graz, Austria. With over 20 years of experience, he specializes in bridging complex backend architectures with intuitive, scalable user interfaces.", metadata: { category: "Persona & Philosophy", type: "persona", topic: "identity" } },
    { content: "Emile's core philosophy is that 'every system is a story—every story, a system in disguise'. He views his role as a 'Systems Whisperer,' turning tangled pipelines into clean, living frameworks.", metadata: { category: "Persona & Philosophy", type: "persona", topic: "philosophy" } },
    { content: "Emile builds digital worlds intended to 'make logic feel human and humanity feel designed'. He has transitioned from traditional frontend development to treating AI-native development and 'Agentic Coding' as the natural evolution of the craft.", metadata: { category: "Persona & Philosophy", type: "persona", topic: "summary" } },
    
    // Technical Arsenal & AI Workflow
    { content: "Emile's technical stack includes React 19, Next.js 16 (App Router), TypeScript, and Python (FastAPI/Pydantic). He also works with Unreal Engine 5 (C++/Blueprints) and mobile ecosystems like Swift for iOS and React Native.", metadata: { category: "Technical Arsenal & AI Workflow", type: "skills", topic: "technical" } },
    { content: "A specialist in AI orchestration, Emile utilizes tools such as Ollama, n8n, Claude Code, and multi-agent memory layers like Honcho. He uses AI agents as 'design sparring partners' to handle boilerplate and refactoring, allowing him to ship at a pace typically requiring 2-3 engineers.", metadata: { category: "Technical Arsenal & AI Workflow", type: "skills", topic: "ai_workflow" } },
    { content: "Emile's approach to 'Vibe Coding' involves integrating local LLMs like Ollama to transform static forms into AI-augmented conversations. He maintains strict engineering discipline around state management and human-in-the-loop validation.", metadata: { category: "Technical Arsenal & AI Workflow", type: "skills", topic: "vibe_coding" } },
    
    // Key Projects & Case Studies
    { content: "As Co-Founder of MonstoryX, Emile architected an immersive digital storytelling platform using Unreal Engine 5, custom C++ plugins, and backend logic via Nakama.", metadata: { category: "Key Projects & Case Studies", type: "projects", topic: "MonstoryX" } },
    { content: "Emile developed Hermes, a multi-agent AI operating system on GCP that automates content production. The system uses a hub-and-spoke architecture with 'Herman' the orchestrator and serverless GPU workers to reduce costs by 95%.", metadata: { category: "Key Projects & Case Studies", type: "projects", topic: "Hermes" } },
    { content: "Through his consultancy, Hobolabs Digital, Emile built Moxis, an AI-powered document intelligence platform. The platform uses a hybrid approach of geometric CV and Vision Language Models (VLMs) to classify and export form fields from legal contracts.", metadata: { category: "Key Projects & Case Studies", type: "projects", topic: "Moxis" } },
    { content: "Emile contributed to high-stakes regulated projects, including the official German Gematik e-Prescription App (ePA) and Mazda's pan-European mobile ecosystem (My Mazda App).", metadata: { category: "Key Projects & Case Studies", type: "projects", topic: "Enterprise" } },
    { content: "Case Study highlight: Editorial Canvas Portfolio (This Website). An experimental, AI-native interactive portfolio where users chat with Emile's Digital Twin. Built using Next.js, React Flow, Vercel AI SDK, and Local RAG with Ollama, featuring autonomous node spawning and Brutalist aesthetics.", metadata: { category: "Key Projects & Case Studies", type: "projects", topic: "Editorial Canvas" } }
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
