import { embedMany } from 'ai';
import { ollama } from 'ai-sdk-ollama';
import fs from 'fs';
import path from 'path';

async function run() {
  console.log('Ingesting Persona Data...');
  // For Phase 1, we ingest a simple array of core facts about Emile.
  const chunks = [
    { content: "Emile Harmel is a Chief Creative Technologist, Systems Architect, and Founder based in Graz, Austria. He can be reached at hello@hobolabs.digital.", metadata: { type: "persona", topic: "identity" } },
    { content: "Emile's professional summary: 'I build worlds that make logic feel human — and humanity feel designed.' He comes from a deep background in traditional Frontend Development and UI/UX Design, and treats AI-Native Development and Agentic Coding as the natural evolution of that craft.", metadata: { type: "persona", topic: "summary" } },
    { content: "Emile has over 20 years of experience bridging complex backend architectures and intuitive, highly scalable user interfaces. He specializes in enterprise platform modernization, secure mobile ecosystems, and AI-driven automation workflows.", metadata: { type: "experience", topic: "overview" } },
    { content: "Emile's philosophy: 'Every system is a story — every story, a system in disguise.' His superpower is being a 'Systems Whisperer', turning tangled pipelines and abstract emotions into clean, living frameworks.", metadata: { type: "persona", topic: "philosophy" } },
    { content: "Currently, Emile is the Co-Founder & Chief Creative Technologist at MonstoryX (2024 - Present), an immersive digital storytelling platform where he architected the Unreal Engine 5 game system and AI multi-agent orchestration.", metadata: { type: "experience", topic: "MonstoryX" } },
    { content: "Previously, Emile was the Lead Product Architect & Creative Technologist for the Xitrust / Moxis Platform (2024 - 2026), spearheading the architectural reinvention of an enterprise platform using Next.js 16, Python FastAPI, and local LLMs (Ollama).", metadata: { type: "experience", topic: "Xitrust" } },
    { content: "From 2021 to 2024, Emile worked as an iOS Developer at Rise World, building the official German e-prescription app (ePA) using Swift and Native iOS frameworks within a strictly regulated healthcare environment.", metadata: { type: "experience", topic: "Rise World" } },
    { content: "From 2016 to 2021, Emile was the Lead Creative Developer & Technical Director at Demodern, developing viral AR games for Nestlé, mobile ecosystems for Mazda, and conversational interfaces for Super RTL.", metadata: { type: "experience", topic: "Demodern" } },
    { content: "Emile's technical arsenal includes Frontend (React 19, Next.js 16, Vite, Vue), Backend & AI (Python, FastAPI, Ollama, n8n, OpenAI, Claude), Mobile & Creative (Swift, React Native, Unreal Engine 5, WebGL), and DevOps (GCP Cloud Run, Docker, Nx Monorepo).", metadata: { type: "skills", topic: "technical" } },
    { content: "Emile's preferred tools are Figma, Blender, Unreal Engine, Antigravity, Claude Code, VS Code, and Docker.", metadata: { type: "skills", topic: "tools" } },
    { content: "Emile's educational background includes an HND in Multimedia Design and an ND in Art Foundation with Mathematics from City College Manchester.", metadata: { type: "education", topic: "college" } },
    { content: "Case Study highlight: Building Moxis, an AI-Powered Document Intelligence Platform using a hybrid AI pipeline (geometric CV + Vision Language Models) shipped as a source-code license to enterprises.", metadata: { type: "projects", topic: "Moxis" } },
    { content: "Case Study highlight: Hermes, a Multi-Agent AI Operating System for Autonomous Content Production using a hub-and-spoke pattern on GCP with ComfyUI and LTX-Video to generate animated shorts from character references.", metadata: { type: "projects", topic: "Hermes" } },
    { content: "Case Study highlight: Editorial Canvas Portfolio (This Website). An experimental, AI-native interactive portfolio where users chat with Emile's Digital Twin. Built using Next.js, React Flow, Vercel AI SDK, and Local RAG with Ollama, featuring autonomous node spawning and Brutalist aesthetics.", metadata: { type: "projects", topic: "Editorial Canvas" } }
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
