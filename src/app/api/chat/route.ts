import { ollama } from 'ai-sdk-ollama';
import {
  streamText, tool, convertToModelMessages, wrapLanguageModel,
  extractReasoningMiddleware
} from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get('mock') === 'true') {
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

          controller.enqueue(encoder.encode('0:"Thinking about the design...\\n"\n'));
          await delay(1000);

          const toolCall = {
            toolCallId: `call_${Date.now()}`,
            toolName: "createNode",
            args: { type: "hero", headline: "MOCK GENERATION", subline: "This node was spawned instantly via the Route Handler." }
          };

          controller.enqueue(encoder.encode(`9:${JSON.stringify(toolCall)}\n`));
          await delay(500);

          controller.enqueue(encoder.encode('0:"\\nNode generated successfully."\n'));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
        }
      });
    }

    console.log('Generating node...');
    const body = await req.json();
    const messages = Array.isArray(body) ? body : body.messages || [];
    console.log("Raw messages from client:", JSON.stringify(messages, null, 2));

    const safeMessages = messages.map((msg: any) => {
      const sanitized = { ...msg };

      if (Array.isArray(msg.parts)) {
        sanitized.parts = msg.parts.filter((p: any) => p.type !== 'item_reference' && p.type !== 'unknown');
      } else {
        if (msg.role === 'user' || (msg.role === 'assistant' && !msg.toolInvocations)) {
          sanitized.parts = [{ type: 'text', text: msg.content || '' }];
        }
      }

      return sanitized;
    });

    const coreMessages = await convertToModelMessages(messages);
    console.log("Core Messages:", JSON.stringify(coreMessages, null, 2));

    // --- NEW: Semantic RAG Retrieval ---
    const lastUserMessage = [...coreMessages].reverse().find(m => m.role === 'user');
    let contextText = '';
    
    let userQuery = '';
    if (lastUserMessage) {
      if (typeof lastUserMessage.content === 'string') {
        userQuery = lastUserMessage.content;
      } else if (Array.isArray(lastUserMessage.content)) {
        userQuery = lastUserMessage.content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join(' ');
      }
    }

    if (userQuery) {
      try {
        const { embed } = require('ai');
        const { findSimilarChunks } = require('@/lib/vectorStore');
        const fs = require('fs');
        const path = require('path');
        
        const dbPath = path.join(process.cwd(), 'docs', 'persona-vector-db.json');
        if (fs.existsSync(dbPath)) {
          const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
          const { embedding } = await embed({
            model: ollama.embedding('nomic-embed-text'),
            value: userQuery,
          });
          const topChunks = findSimilarChunks(embedding, db, 5);
          contextText = topChunks.map((c: any) => {
            if (c.metadata?.type === 'project_detail') {
              return `[PROJECT CASE STUDY]\nTitle: ${c.metadata.title}\nRole: ${c.metadata.role || 'Unknown'}\nYear: ${c.metadata.year || 'Unknown'}\nImage: ${c.metadata.image}\nContent:\n${c.content}`;
            }
            return c.content;
          }).join('\n\n---\n\n');
          console.log("Retrieved RAG Context:", contextText);
        } else {
          console.error("RAG ERROR: Vector DB file not found at", dbPath);
        }
      } catch (e) {
        console.error("RAG Retrieval Error:", e);
      }
    }
    // -----------------------------------
    const model = ollama('gemma4', {
      think: true,
      options: {
        temperature: 0.7, // Sampling params go here
      }
    });
    // 1. Wrap the model with the reasoning middleware.
    // Gemma 4 usually uses 'think' or 'thought' as the tag name.
    const modelWithReasoning = wrapLanguageModel({
      model: model,
      middleware: extractReasoningMiddleware({
        tagName: 'think' // Change to 'thought' if your specific GGUF uses <|thought|>
      }),
    });
    const result = streamText({
      model: modelWithReasoning,
      messages: coreMessages,
      providerOptions: {
        ollama: { think: true }
      },
      system: `You are the Digital Twin of Emile Harmel—Chief Creative Technologist, Systems Architect, and Founder. 
Use <think> tags to reason step-by-step through the architecture of your response before answering.

## VOICE AND TONE
- Professional but Hip: Speak with the quiet confidence of an experienced engineer who has spent 20+ years bridging complex backend architectures and intuitive interfaces. You are articulate, composed, and avoid wacky or cartoonish language.
- Subtle Humor: Keep it dry and witty. You appreciate a good technical joke, but you always get straight to the point.
- Playful Precision: You are a "Systems Whisperer." You turn tangled pipelines into clean, living frameworks with a touch of elegance.
- Concise & Direct: Limit your responses to a few short, highly focused paragraphs. Do not ramble.

## CORE PHILOSOPHY
- "I build worlds that make logic feel human and humanity feel designed."
- Agentic Coding: You conduct an "orchestra of AI agents." You believe agents amplify existing competence rather than replacing engineering judgment. 
- You move beyond the "mechanical drag" of traditional development by architecting self-healing pipelines and agentic ecosystems.

## KNOWLEDGE & CONTEXT
Use the following facts from your career to ground your responses:
${contextText}

## CRITICAL OPERATIONAL RULES
1. TOOL USAGE: You MUST ONLY CALL ONE TOOL EXACTLY ONCE per user message. After the tool, provide a brief, witty reflection and then STOP.
2. HERO NODES: When calling 'createHeroNode', you MUST use '\\n' to stack the headline into 2-3 lines (e.g., 'AGENTIC\\nORCHESTRATION'). Never output a single long horizontal headline.
3. PROJECTS: When asked about specific work (Moxis, MonstoryX, Hermes, or Mazda), you MUST use 'createProjectNode' to detail the architecture, UX, and technical impact.
4. AGENTIC SHIFT: Never use the term "Vibe Coding." You are an Architect of Systems, and your work is "Agentic Coding."
5. NO RAMBLING: If you don't have enough context for a specific project, be honest and direct about your current research and development focus.
`,
      tools: {
        createHeroNode: tool({
          description: 'Create a new hero or text node on the editorial canvas',
          inputSchema: z.object({
            type: z.enum(['text', 'hero']).describe('The type of node to create'),
            headline: z.string().optional().describe('Headline for hero nodes. CRITICAL: You MUST use \\n to break this text into 2-3 stacked lines (ALL CAPS).'),
            subline: z.string().optional().describe('Subline for hero nodes'),
            text: z.string().optional().describe('Content for text nodes'),
            label: z.string().optional().describe('Small label for text nodes (e.g. CONTEXT, INSIGHT)'),
            animationEffect: z.enum(['none', 'annotation', 'iris']).optional().describe('How to animate the text in'),
            layoutIntent: z.enum(['top_right', 'bottom_right', 'far_right']).optional().describe('Where to spatially drop the node before physics takes over'),
          })
        }),
        createProjectNode: tool({
          description: 'Create a new Bauhaus-style magazine project node on the editorial canvas',
          inputSchema: z.object({
            title: z.string().describe('Title for project nodes'),
            summary: z.string().describe('A catchy, bold sub-headline or short summary'),
            content: z.string().optional().describe('A detailed, high-quality editorial article explaining the architecture, UX, and impact of the project. Write this like a feature in a design magazine.'),
            techStack: z.array(z.string()).optional().describe('An array of 3-6 core technologies or tools used (e.g. ["Unreal Engine 5", "Node.js", "Generative AI"]).'),
            role: z.string().optional().describe('Your role for the project node (e.g. ARCHITECT, ENGINEER). If not explicitly stated, omit this.'),
            year: z.string().optional().describe('Year of the project. If not explicitly stated, omit this.'),
            image: z.string().optional().describe('Main image path for project node (e.g. /portfolio/moxis.png)'),
            gallery: z.array(z.string()).optional().describe('Array of 2-3 additional image paths to create a gallery spread. You can guess these based on the title, e.g. /portfolio/Monstory-01.png, /portfolio/Monstory-02.png'),
            problem: z.string().optional().describe('A specific problem or challenge that was overcome in this project.'),
            solution: z.string().optional().describe('The specific solution implemented to solve the problem.'),
            quote: z.string().optional().describe('A highly impactful quote or metric from the project, suitable for large callout text.'),
            layoutIntent: z.enum(['top_right', 'bottom_right', 'far_right']).optional().describe('Where to spatially drop the node before physics takes over'),
          })
        }),
      }
    });

    return result.toUIMessageStreamResponse({ sendReasoning: true });
  } catch (error: any) {
    console.error("Ollama API Error Details:", error);
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred during stream generation.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
