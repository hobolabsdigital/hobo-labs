import { Node, Edge } from '@xyflow/react';
import type { HeroNodeData, DossierNodeData } from '@/lib/ai/types';
import {
  H_SPACING,
  PROJECT_OFFSET,
  DEFAULT_X,
  DEFAULT_Y,
  JITTER_RANGE,
  JITTER_RANGE_SMALL,
  NODE_DIMS,
  NODE_DIMS_DEFAULT,
  AABB_GAP,
} from '@/features/canvas/constants';

/**
 * Unified position calculator for all node types.
 *
 * Priority:
 *   1. `data.layoutIntent` — explicit placement from the AI agent
 *   2. `sourceNode` — offset from the parent node with vertical jitter
 *   3. Defaults from constants
 */
export const calculateNodePosition = (
  data: { layoutIntent?: string } | undefined,
  sourceNode: Node | undefined,
  offset: number = H_SPACING,
  jitter: number = JITTER_RANGE,
  defaultX: number = DEFAULT_X,
  /** Type of the node being created — used to compute width-aware minimum offset */
  nodeType?: string,
) => {
  if (data?.layoutIntent) {
    switch (data.layoutIntent) {
      case 'top_left':     return { x: -400, y: -200 };
      case 'top_right':    return { x: 1600, y: -200 };
      case 'bottom_left':  return { x: -400, y: 1000 };
      case 'bottom_right': return { x: 1600, y: 1000 };
      case 'far_right':    return { x: 2400, y: DEFAULT_Y };
      case 'center':       return { x: DEFAULT_X, y: DEFAULT_Y };
    }
  }

  if (sourceNode) {
    // Ensure the spawn offset is at least wide enough to avoid instant overlap.
    // minOffset = half-width of source + half-width of new node + gap
    const srcDims = NODE_DIMS[sourceNode.type ?? ''] ?? NODE_DIMS_DEFAULT;
    const newDims = NODE_DIMS[nodeType ?? ''] ?? NODE_DIMS_DEFAULT;
    const minOffset = srcDims.w / 2 + newDims.w / 2 + AABB_GAP;
    const safeOffset = Math.max(offset, minOffset);

    return {
      x: sourceNode.position.x + safeOffset,
      y: sourceNode.position.y + (Math.random() * jitter - jitter / 2),
    };
  }

  return { x: defaultX, y: DEFAULT_Y };
};

// ---------------------------------------------------------------------------
// Node factories
// ---------------------------------------------------------------------------

export const createPromptNode = (id: string, text: string, sourceNode?: Node): Node => {
  const position = calculateNodePosition(undefined, sourceNode, H_SPACING, JITTER_RANGE, 400, 'prompt');
  return { id, type: 'prompt', position, data: { text } };
};

export const createGhostNode = (id: string, sourceNode?: Node): Node => {
  const position = calculateNodePosition(undefined, sourceNode, H_SPACING, JITTER_RANGE, DEFAULT_X, 'ghost');
  return { id, type: 'ghost', position, data: { text: "Organizing thoughts...", isFinished: false } };
};

export const createHeroNode = (id: string, data: HeroNodeData, sourceNode?: Node): Node => {
  const position = calculateNodePosition(data, sourceNode, H_SPACING, JITTER_RANGE, DEFAULT_X, 'hero');
  return {
    id,
    type: 'hero',
    position,
    data: {
      headline: data.headline,
      subline: data.subline,
      text: data.text,
      label: data.label,
      animationEffect: data.animationEffect,
    },
  };
};

export const createTextNode = (id: string, text: string, sourceNode?: Node): Node => {
  const position = calculateNodePosition(undefined, sourceNode, H_SPACING, JITTER_RANGE, DEFAULT_X, 'text');
  return { id, type: 'text', position, data: { text, label: 'INSIGHT', animationEffect: 'annotation' } };
};

export const createProjectNode = (id: string, data: Record<string, unknown>, sourceNode?: Node): Node => {
  const position = calculateNodePosition(data, sourceNode, PROJECT_OFFSET, JITTER_RANGE, DEFAULT_X, 'project');
  return {
    id,
    type: 'project',
    position,
    data: {
      title: data.title,
      summary: data.summary,
      role: data.role,
      year: data.year,
      image: data.image,
      content: data.content,
      techStack: data.techStack || [],
      problem: data.problem,
      solution: data.solution,
      quote: data.quote,
      gallery: data.gallery || [],
      slug: data.slug,
      isContextStreaming: data.isContextStreaming,
    },
  };
};

export const createDossierNode = (id: string, slug: string, sourceNode?: Node): Node => {
  const position = calculateNodePosition(undefined, sourceNode, H_SPACING, JITTER_RANGE_SMALL, DEFAULT_X, 'dossier');
  return { id, type: 'dossier', position, data: { slug, status: 'accessing' } };
};

export const createSkeletonProjectNode = (id: string, slug: string, sourceNode?: Node): Node => {
  const position = calculateNodePosition(undefined, sourceNode, PROJECT_OFFSET, JITTER_RANGE_SMALL, 800, 'project');
  return { id, type: 'project', position, data: { isLoading: true, slug } };
};

export const createEdge = (source: string, target: string): Edge => {
  return { id: `e-${source}-${target}`, source, target, sourceHandle: 'src-right', targetHandle: 'tgt-left' };
};
