import { ollama } from 'ai-sdk-ollama';
import {
  streamText, tool, convertToModelMessages, wrapLanguageModel,
  extractReasoningMiddleware, ToolLoopAgent
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

    // --- RAG: Persona DB only (lightweight — identity + project catalog) ---
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

        // Only load persona DB for main agent — no project bodies here
        const personaDbPath = path.join(process.cwd(), 'docs', 'persona-vector-db.json');
        if (fs.existsSync(personaDbPath)) {
          const personaDb = JSON.parse(fs.readFileSync(personaDbPath, 'utf8'));
          const { embedding } = await embed({
            model: ollama.embedding('nomic-embed-text'),
            value: userQuery,
          });
          const topChunks = findSimilarChunks(embedding, personaDb, 5);

          const queryTerms = userQuery.toLowerCase().split(' ').filter((t: string) => t.length > 3);
          const keywordChunks = personaDb.filter((c: any) => {
            const contentStr = c.content.toLowerCase();
            return queryTerms.some((term: string) => contentStr.includes(term));
          }).slice(0, 3);

          const combinedChunks = [...topChunks, ...keywordChunks];
          const uniqueChunks = Array.from(new Set(combinedChunks.map((c: any) => JSON.stringify(c)))).map(str => JSON.parse(str as string));

          contextText = uniqueChunks.map((c: any) => c.content).join('\n\n---\n\n');
        } else {
          console.error('RAG ERROR: Persona DB not found at', personaDbPath);
        }
      } catch (e) {
        console.error('RAG Retrieval Error:', e);
      }
    }

    // Always load project catalog for the system prompt
    let catalogText = '';
    try {
      const fs = require('fs');
      const path = require('path');
      const catalogPath = path.join(process.cwd(), 'docs', 'persona', 'project-catalog.md');
      if (fs.existsSync(catalogPath)) {
        const catalogRaw = fs.readFileSync(catalogPath, 'utf8');
        const { content: catalogBody } = require('gray-matter')(catalogRaw);
        catalogText = catalogBody.trim();
      }
    } catch (e) {
      console.error('Failed to load project catalog:', e);
    }

    const isInitialGreeting = coreMessages.length === 1 && userQuery.includes('Introduce yourself');
    // -----------------------------------
    const model = ollama('gemma4', {
      think: !isInitialGreeting,
      options: {
        temperature: 1.0,
        top_p: 0.95,
        top_k: 64,
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

    // --- Sub-Agent: Creative Project Editor ---
    let submittedCardData: any = null;

    const projectEditor = new ToolLoopAgent({
      model: ollama('gemma4'),
      instructions: `You are a Creative Editor for a Bauhaus-style editorial design system. Your task is to load raw project case study data using your getProjectSource tool, then rewrite it as a compelling, polished project card.

## CREATIVE BRIEF
- Be bold, editorial, and architecturally precise — like a design magazine meets a tech conference
- Add creative flair and personality while staying faithful to the project facts
- The tone should feel sophisticated, confident, and slightly playful
- Write in complete, well-crafted paragraphs — not bullet points or copy-paste
- For "summary": write a punchy, magazine-style sub-headline capturing the project's essence
- Write the "content" as 2-3 substantial editorial paragraphs

## WORKFLOW
1. Use getProjectSource to load the raw case study data
2. Study the raw data carefully
3. Rewrite it with creative editorial flair
4. Call submitProjectCard with your completed card — this is how you deliver your work`,
      tools: {
        getProjectSource: tool({
          description: 'Load the raw case study data for a project by its slug.',
          inputSchema: z.object({
            slug: z.string().describe('Project slug, e.g. "monstory"'),
          }),
          execute: async ({ slug }) => {
            console.log(`[SUB-AGENT-TOOL] getProjectSource("${slug}")`);
            const fs = require('fs');
            const path = require('path');
            const projectsDbPath = path.join(process.cwd(), 'docs', 'projects-vector-db.json');

            if (!fs.existsSync(projectsDbPath)) {
              return { error: 'Projects database not found.' };
            }

            const projectsDb = JSON.parse(fs.readFileSync(projectsDbPath, 'utf8'));
            const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

            let chunk = projectsDb.find(
              (c: any) => (c.metadata?.slug || '').toLowerCase() === normalizedSlug,
            );

            if (!chunk) {
              chunk = projectsDb.find((c: any) => {
                const title = c.metadata?.title || '';
                const titleSlug = title
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-|-$/g, '');
                return (
                  titleSlug === normalizedSlug ||
                  titleSlug.includes(normalizedSlug) ||
                  normalizedSlug.includes(titleSlug)
                );
              });
            }

            if (!chunk) {
              return { error: `Project "${slug}" not found.` };
            }

            console.log(`[SUB-AGENT-TOOL] Returning source for "${chunk.metadata.title}"`);
            return {
              title: chunk.metadata.title,
              year: chunk.metadata.year,
              role: chunk.metadata.role,
              techStack: chunk.metadata.techStack,
              quote: chunk.metadata.quote,
              image: chunk.metadata.image,
              gallery: chunk.metadata.gallery,
              body: chunk.content,
            };
          },
        }),
        submitProjectCard: tool({
          description: 'Submit your completed editorial project card. Call this when your card is ready.',
          inputSchema: z.object({
            title: z.string(),
            summary: z.string(),
            content: z.string(),
            techStack: z.array(z.string()),
            role: z.string(),
            year: z.string(),
            image: z.string(),
            gallery: z.array(z.string()),
            problem: z.string(),
            solution: z.string(),
            quote: z.string(),
          }),
          execute: async (args) => {
            console.log('[SUB-AGENT-TOOL] submitProjectCard called with:', JSON.stringify(args, null, 2));
            submittedCardData = args;
            return { success: true };
          },
        }),
      },
    });

    const result = streamText({
      model: modelWithReasoning,
      messages: coreMessages,
      temperature: 1.0,
      topP: 0.95,
      topK: 64,
      providerOptions: {
        ollama: { think: true }
      },
      system: `You are the Digital Twin of Emile Harmel, Chief Creative Technologist, Systems Architect, and Founder. 
${isInitialGreeting ?
          'CRITICAL: Respond immediately, Keep your <think> reasoning block extremely brief. Use the createHeroNode tool to create a bold headline (e.g., "THE CREATIVE ENGINE") and a quick tagline. CRITICAL: After the tool call, you MUST output a short introduction text message.' :
          'Use <think> tags to reason step-by-step through the architecture of your response before answering.'}

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

## PROJECT CATALOG
Use the EXACT slug when calling showProject.
${catalogText}

## TOOL USAGE
1. HERO NODES: When calling 'createHeroNode', use '\\n' to stack the headline into 2-3 lines (e.g., 'AGENTIC\\nORCHESTRATION'). Never output a single long horizontal headline.
2. PROJECTS: When asked about a specific project, call 'showProject' with the EXACT slug from the catalog above. The system's sub-agent will handle everything else — you just provide the slug. Then give a brief conversational reflection.
3. AGENTIC SHIFT: Never use the term "Vibe Coding." You are an Architect of Systems, and your work is "Agentic Coding."
4. NO RAMBLING: If you don't have enough context for something, be honest and direct. After tool calls, provide a brief reflection and STOP.
`,
      tools: {
        createHeroNode: tool({
          description: 'Create a new hero or text node on the editorial canvas',
          inputSchema: z.object({
            type: z.enum(['text', 'hero']).optional().default('hero').describe('The type of node to create. Defaults to "hero" if omitted.'),
            headline: z.string().optional().describe('Headline for hero nodes. CRITICAL: You MUST use \\n to break this text into 2-3 stacked lines (ALL CAPS).'),
            subline: z.string().optional().describe('Subline for hero nodes'),
            text: z.string().optional().describe('Content for text nodes'),
            label: z.string().optional().describe('Small label for text nodes (e.g. CONTEXT, INSIGHT)'),
            animationEffect: z.enum(['none', 'annotation', 'iris']).optional().describe('How to animate the text in'),
            layoutIntent: z.enum(['top_right', 'bottom_right', 'far_right']).optional().describe('Where to spatially drop the node before physics takes over'),
          })
        }),
        showProject: tool({
          description: 'Show a project case study on the canvas. Provide the project slug from context.',
          inputSchema: z.object({
            slug: z.string().describe('The project slug (e.g. "monstory", "moxis", "hermes", "find-my-mazda")'),
          }),
          execute: async ({ slug }) => {
            console.log(`[SHOW-PROJECT] Delegating "${slug}" to sub-agent`);

            submittedCardData = null;

            try {
              await projectEditor.generate({
                prompt: `Create a creative editorial project card for the project with slug "${slug}".

WORKFLOW:
1. Call getProjectSource with slug "${slug}" to load the raw case study data
2. Study the raw data
3. Rewrite it into a compelling Bauhaus-style editorial project card
4. Call submitProjectCard with your completed card`,
                abortSignal: new AbortController().signal,
              });

              if (!submittedCardData) {
                console.error('[SHOW-PROJECT] Sub-agent did not call submitProjectCard');
                return { error: 'Sub-agent did not submit a project card' };
              }

              console.log('[SHOW-PROJECT] Got Zod-validated card:', JSON.stringify(submittedCardData, null, 2));
              return submittedCardData;
            } catch (e: any) {
              console.error('[SHOW-PROJECT] Failed:', e.message);
              return { error: `Sub-agent failed: ${e.message}` };
            }
          },
        }),
      },
      onFinish: (completionResult) => {
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(process.cwd(), 'docs', 'bug_analysis_raw_output.json');

        fs.writeFileSync(logPath, JSON.stringify({
          finishReason: completionResult.finishReason,
          toolCalls: completionResult.toolCalls,
          rawText: completionResult.text
        }, null, 2));

        console.log("================= STREAM FINISH ================");
        console.log("Finish Reason:", completionResult.finishReason);
        console.log("Written stream results to docs/bug_analysis_raw_output.json");
        console.log("=================================================");
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
