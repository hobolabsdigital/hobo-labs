import { z } from 'zod';

export const NodeInteractionSchema = z.object({
  id: z.string(),
  type: z.enum(['project', 'hero', 'ghost', 'text']),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.string(), z.any()),
});

export const ProjectNodeDataSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  year: z.string(),
  role: z.string(),
  slug: z.string(),
  problem: z.string(),
  solution: z.string(),
  quote: z.string(),
  techStack: z.array(z.string()).optional(),
  gallery: z.array(z.string()).optional(),
  image: z.string().optional(),
  isContextStreaming: z.boolean().optional(),
});

export type NodeInteraction = z.infer<typeof NodeInteractionSchema>;
export type ProjectNodeData = z.infer<typeof ProjectNodeDataSchema>;

// ---------------------------------------------------------------------------
// Node data interfaces for each canvas node type
// ---------------------------------------------------------------------------

export interface HeroNodeData {
  headline?: string;
  subline?: string;
  text?: string;
  label?: string;
  animationEffect?: 'none' | 'annotation' | 'iris';
  layoutIntent?: 'top_right' | 'bottom_right' | 'far_right';
  creationIndex?: number;
}

export interface TextNodeData {
  text: string;
  label?: string;
  animationEffect?: string;
  isFinished?: boolean;
  creationIndex?: number;
}

export interface GhostNodeData {
  text: string;
  isFinished: boolean;
  creationIndex?: number;
}

export interface PromptNodeData {
  text: string;
  creationIndex?: number;
}

export interface DossierNodeData {
  slug: string;
  status: string;
}

// ---------------------------------------------------------------------------
// RAG / Vector DB
// ---------------------------------------------------------------------------

export interface RAGChunk {
  id?: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
}
