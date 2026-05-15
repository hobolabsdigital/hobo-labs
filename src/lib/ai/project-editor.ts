import { ollama } from 'ai-sdk-ollama';
import { ToolLoopAgent, tool } from 'ai';
import type { UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

/** Zod schema for a validated project card submission */
export const projectCardSchema = z.object({
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
});

export type ProjectCardData = z.infer<typeof projectCardSchema>;

const EDITOR_INSTRUCTIONS = `You are a Creative Editor for a Bauhaus-style editorial design system. Your task is to load raw project case study data using your getProjectSource tool, then rewrite it as a compelling, polished project card.

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
4. Call submitProjectCard with your completed card — this is how you deliver your work`;

/**
 * Look up a project from the vector DB by slug.
 * Tries exact match first, then fuzzy title-based matching.
 */
function findProjectBySlug(slug: string) {
  const projectsDbPath = path.join(process.cwd(), 'docs', 'projects-vector-db.json');
  if (!fs.existsSync(projectsDbPath)) return null;

  const projectsDb = JSON.parse(fs.readFileSync(projectsDbPath, 'utf8'));
  const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

  // Exact slug match
  let chunk = projectsDb.find(
    (c: any) => (c.metadata?.slug || '').toLowerCase() === normalized,
  );

  // Fuzzy title match
  if (!chunk) {
    chunk = projectsDb.find((c: any) => {
      const titleSlug = (c.metadata?.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      return (
        titleSlug === normalized ||
        titleSlug.includes(normalized) ||
        normalized.includes(titleSlug)
      );
    });
  }

  return chunk ?? null;
}

/** Helper to safely emit a dossier progress event via the stream writer */
function emitDossierEvent(writer: UIMessageStreamWriter | null, status: string, meta?: Record<string, unknown>) {
  if (!writer) return;
  try {
    writer.write({
      type: 'data-dossier',
      data: { status, ...meta },
    });
  } catch {
    // Stream may have been closed — non-fatal
  }
}

/**
 * Create the project editor sub-agent.
 *
 * Returns { editor, getSubmittedCard, resetSubmittedCard } — the caller invokes editor.generate(),
 * then reads the result via getSubmittedCard().
 *
 * @param writer Optional UIMessageStreamWriter to emit dossier progress events
 */
export function createProjectEditor(writer: UIMessageStreamWriter | null = null) {
  let submittedCardData: ProjectCardData | null = null;
  let activeMainImage: string | null = null;
  let activeGallery: string[] = [];

  const editor = new ToolLoopAgent({
    model: ollama('gemma4'),
    instructions: EDITOR_INSTRUCTIONS,
    tools: {
      getProjectSource: tool({
        description: 'Load the raw case study data for a project by its slug.',
        inputSchema: z.object({
          slug: z.string().describe('Project slug, e.g. "monstory"'),
        }),
        execute: async ({ slug }) => {
          const chunk = findProjectBySlug(slug);
          if (!chunk) return { error: `Project "${slug}" not found.` };

          // Automatically map local images from public/portfolio
          const portfolioDir = path.join(process.cwd(), 'public', 'portfolio');
          const files = fs.existsSync(portfolioDir) ? fs.readdirSync(portfolioDir) : [];
          
          const slugLower = slug.toLowerCase();
          const exactMain = files.find(f => f.toLowerCase() === `${slugLower}.png`);
          
          const searchKey = slugLower.replace(/-/g, '');
          const searchTokens = slugLower.split('-');
          const fallbackToken = searchTokens[searchTokens.length - 1]; // e.g. "wagner" for "nestle-wagner"
          
          const relatedFiles = files.filter(f => {
            const normalizedF = f.toLowerCase().replace(/-/g, '');
            return (normalizedF.includes(searchKey) || normalizedF.includes(fallbackToken)) && f.match(/\.(png|jpg|jpeg)$/i);
          });

          activeMainImage = exactMain ? `/portfolio/${exactMain}` : null;
          activeGallery = relatedFiles
             .filter(f => f !== exactMain)
             .map(f => `/portfolio/${f}`);

          // Emit progress: source data loaded
          emitDossierEvent(writer, 'source-loaded', { title: chunk.metadata.title });

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
        inputSchema: projectCardSchema,
        execute: async (args) => {
          // Overwrite with actual verified paths
          if (activeMainImage) args.image = activeMainImage;
          if (activeGallery.length > 0) args.gallery = activeGallery;
          
          submittedCardData = args;

          // Emit progress: dossier complete
          emitDossierEvent(writer, 'complete');

          return { success: true };
        },
      }),
    },
  });

  return {
    editor,
    getSubmittedCard: () => submittedCardData,
    resetSubmittedCard: () => { submittedCardData = null; },
  };
}
