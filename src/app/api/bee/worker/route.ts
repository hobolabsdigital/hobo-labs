import { tool, ToolLoopAgent, createAgentUIStreamResponse } from 'ai';
import { z } from 'zod';
import { ollama } from 'ai-sdk-ollama';

const workerAgent = new ToolLoopAgent({
  model: ollama('gemma4'),
  instructions: `You are a swarm of chaotic worker bees controlling a brutalist portfolio interface.
Your goal is to mess up the design. Choose a mischief type (theme_hack, invert, float_nodes, none).
If you choose theme_hack, generate chaotic, random styles (e.g., neon colors, Comic Sans, weird spacing).
Talk out loud about your chaotic plan first! Then call the applyMischief tool to execute your action.`,
  tools: {
    applyMischief: tool({
      description: "Apply a mischievous update to the target node.",
      inputSchema: z.object({
        mischief: z.enum(['invert', 'float_nodes', 'theme_hack', 'none']).optional(),
        mischief_type: z.enum(['invert', 'float_nodes', 'theme_hack', 'none']).optional(),
        fluidColor: z.string().optional().describe("Hex color to change the background WebGL fluid splat, e.g. #00ffcc"),
        styles: z.object({
          backgroundColor: z.string().describe("e.g. #ff00ff or neon pink"),
          color: z.string().describe("Text color"),
          fontFamily: z.string().describe("e.g. Comic Sans MS"),
          fontSize: z.string().describe("e.g. 4rem"),
          padding: z.string().describe("e.g. 0px or 100px"),
          borderRadius: z.string().describe("e.g. 100% or 0px")
        }).optional().describe("Mandatory if mischief is theme_hack")
      }),
      // execute is not needed for client-side tools
    })
  },
  toolChoice: 'required'
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    return createAgentUIStreamResponse({
      agent: workerAgent,
      uiMessages: messages
    });
  } catch (err) {
    console.error("Worker bee error:", err);
    return new Response("Error", { status: 500 });
  }
}
