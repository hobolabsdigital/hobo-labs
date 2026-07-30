import { generateText } from 'ai';
import { z } from 'zod';
import { createModel } from '@/lib/ai/config';
import { getProjectStaticData } from '@/lib/ai/project-editor';
import { enforceRateLimit } from '@/lib/ai/rate-limit';

/** Only accept the minimal typed fields the route genuinely needs.
 *  Client-supplied `messages` are deliberately ignored — the prompt is built server-side. */
const requestSchema = z.object({
  slug: z.string().min(1).max(100),
});

const contextSchema = z.object({
  problem: z.string(),
  solution: z.string(),
  quote: z.string(),
});

/**
 * Extract a JSON object from model output that may contain markdown fences,
 * reasoning tags, or other wrapper text. Returns the first valid JSON object found.
 */
function extractJSON(text: string): unknown | null {
  // 1. Try parsing the raw text directly
  try { return JSON.parse(text); } catch { /* continue */ }

  // 2. Try extracting from markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch { /* continue */ }
  }

  // 3. Try finding the first { ... } block
  const braceStart = text.indexOf('{');
  const braceEnd = text.lastIndexOf('}');
  if (braceStart !== -1 && braceEnd > braceStart) {
    try { return JSON.parse(text.slice(braceStart, braceEnd + 1)); } catch { /* continue */ }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const limited = enforceRateLimit(req);
    if (limited) return limited;

    const body = await req.json();
    const parsedRequest = requestSchema.safeParse(body);
    if (!parsedRequest.success) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
    }
    const { slug } = parsedRequest.data;
    const projectData = getProjectStaticData(slug);

    if (!projectData) {
      return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404 });
    }

    // Prompt content is fully server-controlled; client input is never forwarded to the model.
    const messagesToUse = [{ role: 'user' as const, content: 'Generate context for this project.' }];

    // Use generateText (not streaming) — this is a small 3-field response,
    // latency is acceptable, and it avoids the Output.object protocol that
    // Ollama Cloud silently ignores.
    const { text } = await generateText({
      model: createModel(false),
      system: `You are writing contextual copy for a portfolio project titled "${projectData.title}".
Based on the raw case study data below, generate a JSON object with exactly these keys:
- "problem": a concise description of the problem the project solves
- "solution": a concise description of the solution
- "quote": a compelling pull quote

Respond with ONLY the JSON object. No markdown, no explanation, no options.

Raw Case Study:
${projectData._rawContent}
`,
      messages: messagesToUse,
    });

    // Extract and validate JSON from whatever the model returned
    const raw = extractJSON(text);
    if (!raw) {
      console.error('[project-context] Could not extract JSON from model output:', text.slice(0, 500));
      return new Response(JSON.stringify({ error: 'Failed to parse model response' }), { status: 502 });
    }

    const parsed = contextSchema.safeParse(raw);
    if (!parsed.success) {
      console.error('[project-context] Schema validation failed:', parsed.error.issues, 'raw:', raw);
      return new Response(JSON.stringify({ error: 'Invalid response schema' }), { status: 502 });
    }

    return new Response(JSON.stringify(parsed.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    // Log detail server-side only; never echo internals to the client.
    console.error('[project-context] Error:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), { status: 500 });
  }
}

