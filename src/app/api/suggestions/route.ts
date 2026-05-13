import { ollama } from 'ai-sdk-ollama';
import { generateObject } from 'ai';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const countStr = url.searchParams.get('count') || '3';
  const count = parseInt(countStr, 10) || 3;

  try {
    const { object } = await generateObject({
      model: ollama('gemma4'),
      system: `You are helping a user interact with a brutalist, minimal design portfolio chatbot. Generate ${count} short, snappy prompt suggestions the user could ask to learn more about the designer, projects, or process. Max 5-8 words per suggestion. No quotes around them. For example: "Show me your latest case study", "What is your design philosophy?". Give EXACTLY ${count} suggestions.`,
      prompt: `Generate ${count} quick prompts.`,
      schema: z.object({
        suggestions: z.array(z.string()).length(count),
      }),
    });
    
    return Response.json(object);
  } catch(e) {
    console.error("Suggestions API Error:", e);
    const fallbacks = [
      "Show me your latest project", 
      "What is your tech stack?", 
      "Tell me about your process",
      "Explain your design system",
      "Show me Hobo Labs"
    ];
    return Response.json({ 
      suggestions: fallbacks.slice(0, count)
    });
  }
}
