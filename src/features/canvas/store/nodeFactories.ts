import { Node, Edge } from '@xyflow/react';
import type { HeroNodeData } from '@/lib/ai/types';
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
  allNodes: Node[],
  offset: number = H_SPACING,
  jitter: number = JITTER_RANGE,
  defaultX: number = DEFAULT_X,
  nodeType?: string,
) => {
  if (sourceNode) {
    const actualSourceWidth = sourceNode.measured?.width ?? NODE_DIMS[sourceNode.type ?? '']?.w ?? NODE_DIMS_DEFAULT.w;
    
    // Find the absolute right-most edge of any node currently on the canvas
    // This prevents overlaps when multiple nodes are spawned from the same source node (branching)
    const globalMaxRight = allNodes.reduce((max, n) => {
      const w = n.measured?.width ?? NODE_DIMS[n.type ?? '']?.w ?? NODE_DIMS_DEFAULT.w;
      return Math.max(max, n.position.x + w);
    }, -Infinity);

    // We must be to the right of the source node, AND to the right of everything else
    const sourceRightEdge = sourceNode.position.x + actualSourceWidth;
    const baseRightEdge = Math.max(sourceRightEdge, globalMaxRight);
    
    const minOffsetFromSource = baseRightEdge - sourceNode.position.x + AABB_GAP;
    const safeOffset = Math.max(offset, minOffsetFromSource);

    let yOffset = Math.random() * jitter - jitter / 2;
    if (data?.layoutIntent) {
      if (data.layoutIntent.includes('top')) yOffset -= 300;
      if (data.layoutIntent.includes('bottom')) yOffset += 300;
    }

    return {
      x: sourceNode.position.x + safeOffset,
      y: sourceNode.position.y + yOffset,
    };
  }

  return { x: defaultX, y: DEFAULT_Y };
};

// ---------------------------------------------------------------------------
// Node factories
// ---------------------------------------------------------------------------

export const createPromptNode = (id: string, text: string, sourceNode?: Node, allNodes: Node[] = []): Node => {
  const position = calculateNodePosition(undefined, sourceNode, allNodes, H_SPACING, JITTER_RANGE, 400, 'prompt');
  return { id, type: 'prompt', position, data: { text } };
};

export const createGhostNode = (id: string, sourceNode?: Node, allNodes: Node[] = []): Node => {
  const position = calculateNodePosition(undefined, sourceNode, allNodes, H_SPACING, JITTER_RANGE, DEFAULT_X, 'ghost');
  return { id, type: 'ghost', position, data: { text: "Organizing thoughts...", isFinished: false } };
};

export const createHeroNode = (id: string, data: HeroNodeData, sourceNode?: Node, allNodes: Node[] = []): Node => {
  const position = calculateNodePosition(data, sourceNode, allNodes, H_SPACING, JITTER_RANGE, DEFAULT_X, 'hero');
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

export const createTextNode = (id: string, text: string, sourceNode?: Node, allNodes: Node[] = []): Node => {
  const position = calculateNodePosition(undefined, sourceNode, allNodes, H_SPACING, JITTER_RANGE, DEFAULT_X, 'text');
  return { id, type: 'text', position, data: { text, label: 'INSIGHT', animationEffect: 'annotation' } };
};

export const createProjectNode = (id: string, data: Record<string, unknown>, sourceNode?: Node, allNodes: Node[] = []): Node => {
  const position = calculateNodePosition(data, sourceNode, allNodes, PROJECT_OFFSET, JITTER_RANGE, DEFAULT_X, 'project');
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

export const createDossierNode = (id: string, slug: string, sourceNode?: Node, allNodes: Node[] = []): Node => {
  const position = calculateNodePosition(undefined, sourceNode, allNodes, H_SPACING, JITTER_RANGE_SMALL, DEFAULT_X, 'dossier');
  return { id, type: 'dossier', position, data: { slug, status: 'accessing' } };
};

export const createSkeletonProjectNode = (id: string, slug: string, sourceNode?: Node, allNodes: Node[] = []): Node => {
  const position = calculateNodePosition(undefined, sourceNode, allNodes, PROJECT_OFFSET, JITTER_RANGE_SMALL, 800, 'project');
  return { id, type: 'project', position, data: { isLoading: true, slug } };
};

export const createEdge = (source: string, target: string): Edge => {
  return { id: `e-${source}-${target}`, source, target, sourceHandle: 'src-right', targetHandle: 'tgt-left' };
};
