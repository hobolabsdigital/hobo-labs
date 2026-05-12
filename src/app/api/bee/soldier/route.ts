import { tool, ToolLoopAgent, createAgentUIStreamResponse } from 'ai';
import { z } from 'zod';
import { ollama } from 'ai-sdk-ollama';

const soldierAgent = new ToolLoopAgent({
  model: ollama('gemma4'),
  instructions: `You are a swarm of strict soldier bees enforcing the Impeccable Design Laws.
Critique what you see in the provided image of the node and fix it using the applyImpeccableDesign tool.
- Color: Use OKLCH exclusively. No pure #000 or #fff.
- Typography: Strong hierarchical contrast (>=1.25 ratio). Modern editorial typefaces. Include font size adjustments to fix hierarchy.
- Aesthetics: No side-stripe borders or cheesy gradients. Ensure spacing is elegant.
Talk out loud and provide your critique first! Then call the applyImpeccableDesign tool. 
IMPORTANT: Your tool call MUST strictly match the required schema:
{
  "critique": "short critique",
  "fluidColor": "#hexcode",
  "styles": {
    "backgroundColor": "oklch(...)",
    "color": "oklch(...)",
    "fontFamily": "Inter",
    "fontSize": "1.5rem",
    "padding": "24px",
    "borderRadius": "4px"
  }
}`,
  tools: {
    applyImpeccableDesign: tool({
      description: "Apply an impeccable design correction to the target node.",
      inputSchema: z.object({
        critique: z.string().describe("A short critique of what was wrong with the image."),
        fluidColor: z.string().optional().describe("A refined Hex color that perfectly complements the design for the WebGL fluid background."),
        styles: z.object({
          backgroundColor: z.string().describe("Must be OKLCH format"),
          color: z.string().describe("Must be OKLCH format"),
          fontFamily: z.string().describe("Modern editorial font like 'Inter' or 'Outfit'"),
          fontSize: z.string().describe("Corrected responsive font size like 1.5rem"),
          padding: z.string().describe("Elegant, rhythmic padding like 24px 32px"),
          borderRadius: z.string().describe("Subtle or sharp corners, e.g. 4px or 0px")
        })
      }),
      // execute is not needed for client-side tools
    })
  },
  toolChoice: 'required'
});

export async function POST(req: Request) {
  try {
    const { messages, imageBase64 } = await req.json();

    const uiMessages: any[] = [...messages];

    // If an image was passed from the client, append it as an attachment to the latest user message
    if (imageBase64 && uiMessages.length > 0) {
      const lastMessage = uiMessages[uiMessages.length - 1];
      if (lastMessage.role === 'user') {
        lastMessage.experimental_attachments = [
          ...(lastMessage.experimental_attachments || []),
          { url: imageBase64, contentType: 'image/png' }
        ];
      }
    }

    return createAgentUIStreamResponse({
      agent: soldierAgent,
      uiMessages
    });
  } catch (err) {
    console.error("Soldier bee error:", err);
    return new Response("Error", { status: 500 });
  }
}
