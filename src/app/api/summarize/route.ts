import { generateText } from 'ai';
import { z } from 'zod';
import { createModel } from '@/lib/ai/config';
import { enforceRateLimit } from '@/lib/ai/rate-limit';

const MAX_TRANSCRIPT_BYTES = 24 * 1024; // 24KB
const MAX_SUMMARY_CHARS = 2000;

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string().max(4000),
      }),
    )
    .min(1)
    .max(60),
});

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Render the messages as speaker-prefixed lines, dropping the oldest lines
 * until the whole transcript fits under the byte cap.
 */
function buildTranscript(messages: z.infer<typeof requestSchema>['messages']): string {
  const lines = messages.map(m => `${m.role === 'user' ? 'Visitor' : 'Assistant'}: ${m.text}`);
  const encoder = new TextEncoder();

  let total = lines.reduce((sum, line) => sum + encoder.encode(line).byteLength + 1, 0);
  let start = 0;
  while (start < lines.length - 1 && total > MAX_TRANSCRIPT_BYTES) {
    total -= encoder.encode(lines[start]).byteLength + 1;
    start++;
  }

  return lines.slice(start).join('\n');
}

export async function POST(req: Request) {
  try {
    const limited = enforceRateLimit(req);
    if (limited) return limited;

    const body = await req.json();
    const parsedRequest = requestSchema.safeParse(body);
    if (!parsedRequest.success) {
      return jsonError('Invalid request', 400);
    }

    const transcript = buildTranscript(parsedRequest.data.messages);

    // Use generateText (not streaming) — the summary is short, latency is
    // acceptable, and it avoids the Output.object protocol that Ollama Cloud
    // silently ignores.
    let text: string;
    try {
      ({ text } = await generateText({
        model: createModel(false),
        system: `You are summarizing a conversation between an AI portfolio assistant (representing the portfolio owner) and a site visitor.

Write a plain-text summary of under 180 words capturing:
- what the visitor asked about
- which projects or sections were shown
- the visitor's apparent interests
- any open threads left unresolved

No markdown, no headers, no preamble. Respond with the summary text only.

Transcript:
${transcript}
`,
        messages: [{ role: 'user' as const, content: 'Summarize this conversation.' }],
      }));
    } catch (error: unknown) {
      console.error('[summarize] Model call failed:', error);
      return jsonError('Failed to generate summary', 502);
    }

    const summary = text.trim().slice(0, MAX_SUMMARY_CHARS);
    if (!summary) {
      console.error('[summarize] Model returned empty output');
      return jsonError('Failed to generate summary', 502);
    }

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    // Log detail server-side only; never echo internals to the client.
    console.error('[summarize] Error:', error);
    return jsonError('Something went wrong. Please try again.', 500);
  }
}
