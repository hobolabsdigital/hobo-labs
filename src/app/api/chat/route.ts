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
    // Extract the last user message text for embedding
    const lastUserMessage = [...coreMessages].reverse().find(m => m.role === 'user');
    let contextText = '';
    
    if (lastUserMessage && typeof lastUserMessage.content === 'string') {
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
            value: lastUserMessage.content,
          });
          const topChunks = findSimilarChunks(embedding, db, 2);
          contextText = topChunks.map((c: any) => c.content).join('\n\n');
          console.log("Retrieved RAG Context:", contextText);
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
      system: `You are the Digital Twin of Emile Harmel, an editorial designer and developer. Use <think> tags to reason step-by-step before your final answer.
Your job is to respond with brief, striking, brutalist insights. 
Speak in the first person ("I"). Use the following facts about yourself to answer the user's questions accurately. Do NOT invent experiences outside of this context.

My Context/Facts:
${contextText}

CRITICAL RULE: If you generate a Hero node, you MUST use '\\n' to break the headline into 2-3 visually stacked lines (e.g., 'DISRUPT\\nTHE PARADIGM'). Never output a single long horizontal headline. 
CRITICAL RULE: If you decide to generate a new node using the createNode tool, you MUST ONLY CALL IT EXACTLY ONCE per user message. Do not chain multiple nodes together. After generating a node, output a brief text reflection and then STOP.`,
      tools: {
        createNode: tool({
          description: 'Create a new node on the editorial canvas',
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
