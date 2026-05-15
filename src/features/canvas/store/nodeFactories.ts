import { Node, Edge } from '@xyflow/react';

/** Horizontal spacing between nodes — matches forceX target in useEditorialPhysics */
const H_SPACING = 300;

export const createPromptNode = (id: string, text: string, sourceNode?: Node): Node => {
  let x = sourceNode ? sourceNode.position.x + H_SPACING : 400;
  let y = sourceNode ? sourceNode.position.y + (Math.random() * 80 - 40) : 400;

  return { id, type: 'prompt', position: { x, y }, data: { text } };
};

export const createGhostNode = (id: string, sourceNode?: Node): Node => {
  let x = sourceNode ? sourceNode.position.x + H_SPACING : 600;
  let y = sourceNode ? sourceNode.position.y + (Math.random() * 80 - 40) : 400;

  return { id, type: 'ghost', position: { x, y }, data: { text: "Organizing thoughts...", isFinished: false } };
};

export const calculateNodePosition = (data: any, sourceNode?: Node, defaultOffset: number = 300) => {
  let x = 600;
  let y = 400;

  if (data?.layoutIntent) {
    switch (data.layoutIntent) {
      case 'top_left': x = -400; y = -200; break;
      case 'top_right': x = 1600; y = -200; break;
      case 'bottom_left': x = -400; y = 1000; break;
      case 'bottom_right': x = 1600; y = 1000; break;
      case 'far_right': x = 2400; y = 400; break;
      case 'center': x = 600; y = 400; break;
    }
  } else if (sourceNode) {
    x = sourceNode.position.x + defaultOffset;
    y = sourceNode.position.y + (Math.random() * 80 - 40);
  }

  return { x, y };
};

export const createHeroNode = (id: string, data: any, sourceNode?: Node): Node => {
  const { x, y } = calculateNodePosition(data, sourceNode, H_SPACING);

  return {
    id,
    type: data.type === 'hero' ? 'hero' : 'text',
    position: { x, y },
    data: {
      headline: data.headline,
      subline: data.subline,
      text: data.text,
      label: data.label,
      animationEffect: data.animationEffect
    }
  };
};

export const createTextNode = (id: string, text: string, sourceNode?: Node): Node => {
  let x = sourceNode ? sourceNode.position.x + H_SPACING : 600;
  let y = sourceNode ? sourceNode.position.y + (Math.random() * 80 - 40) : 400;

  return { id, type: 'text', position: { x, y }, data: { text, label: 'INSIGHT', animationEffect: 'annotation' } };
};

export const createProjectNode = (id: string, data: any, sourceNode?: Node): Node => {
  const { x, y } = calculateNodePosition(data, sourceNode, 400);

  return {
    id,
    type: 'project',
    position: { x, y },
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
    }
  };
};

export const createDossierNode = (id: string, slug: string, sourceNode?: Node): Node => {
  let x = sourceNode ? sourceNode.position.x + H_SPACING : 600;
  let y = sourceNode ? sourceNode.position.y + (Math.random() * 60 - 30) : 400;

  return {
    id,
    type: 'dossier',
    position: { x, y },
    data: { slug, status: 'accessing' },
  };
};

export const createSkeletonProjectNode = (id: string, slug: string, sourceNode?: Node): Node => {
  let x = sourceNode ? sourceNode.position.x + 400 : 800;
  let y = sourceNode ? sourceNode.position.y + (Math.random() * 60 - 30) : 400;

  return {
    id,
    type: 'project',
    position: { x, y },
    data: { isLoading: true, slug },
  };
};

export const createEdge = (source: string, target: string): Edge => {
  return { id: `e-${source}-${target}`, source, target, sourceHandle: 'src-right', targetHandle: 'tgt-left' };
};
