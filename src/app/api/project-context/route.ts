import { streamText, Output } from 'ai';
import { z } from 'zod';
import { createModel } from '@/lib/ai/config';
import { getProjectStaticData } from '@/lib/ai/project-editor';

const contextSchema = z.object({
  problem: z.string(),
  solution: z.string(),
  quote: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, messages } = body;
    const projectData = getProjectStaticData(slug);

    if (!projectData) {
      return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
    }

    const defaultMessages = [{ role: 'user', content: 'Generate context for this project.' }];
    const messagesToUse = messages && messages.length > 0 ? messages : defaultMessages;

    const result = streamText({
      model: createModel(false),
      output: Output.object({ schema: contextSchema }),
      system: `You are writing contextual copy for a portfolio project titled "${projectData.title}".
Based on the raw case study data below, generate the problem, solution, and a compelling pull quote.
Make it fit the conversation context if any is provided in the chat history.

Raw Case Study:
${projectData._rawContent}
`,
      messages: messagesToUse,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
