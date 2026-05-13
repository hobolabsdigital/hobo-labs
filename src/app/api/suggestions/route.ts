import { ollama } from 'ai-sdk-ollama';
import { generateObject } from 'ai';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { object } = await generateObject({
      model: ollama('gemma4'),
      system: 'You are helping a user interact with a brutalist, minimal design portfolio chatbot. Generate 3 short, snappy prompt suggestions the user could ask to learn more about the designer, projects, or process. Max 5-8 words per suggestion. No quotes around them. For example: "Show me your latest case study", "What is your design philosophy?", "Tell me about the Hobo Labs project".',
      prompt: "Generate 3 quick prompts.",
      schema: z.object({
        suggestions: z.array(z.string()).length(3),
      }),
    });
    
    return Response.json(object);
  } catch(e) {
    console.error("Suggestions API Error:", e);
    return Response.json({ 
      suggestions: [
        "Show me your latest project", 
        "What is your tech stack?", 
        "Tell me about your process"
      ] 
    });
  }
}
