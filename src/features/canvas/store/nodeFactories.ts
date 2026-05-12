import { Node, Edge } from '@xyflow/react';

const getRandomOffset = (base: number, spread: number) => base + (Math.random() * spread - spread / 2);

export const createPromptNode = (id: string, text: string, sourceNode?: Node): Node => {
  let x = 400 + Math.random() * 200;
  let y = 400 + Math.random() * 200;

  if (sourceNode) {
    x = sourceNode.position.x + 150 + Math.random() * 100;
    y = sourceNode.position.y + (Math.random() * 100 - 50);
  }

  return { id, type: 'prompt', position: { x, y }, data: { text } };
};

export const createGhostNode = (id: string, sourceNode?: Node): Node => {
  let x = 600 + Math.random() * 200 - 100;
  let y = 600 + Math.random() * 200 - 100;

  if (sourceNode) {
    x = sourceNode.position.x + 150 + Math.random() * 50;
    y = sourceNode.position.y + 100 + (Math.random() * 50 - 25);
  }

  return { id, type: 'ghost', position: { x, y }, data: { text: "Organizing thoughts...", isFinished: false } };
};

export const calculateNodePosition = (data: any, sourceNode?: Node, defaultOffset: number = 150) => {
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
    x = sourceNode.position.x + defaultOffset + Math.random() * 50;
    y = sourceNode.position.y + 100 + (Math.random() * 50 - 25);
  } else {
    x = getRandomOffset(600, 400);
    y = getRandomOffset(400, 400);
  }

  return { x, y };
};

export const createHeroNode = (id: string, data: any, sourceNode?: Node): Node => {
  const { x, y } = calculateNodePosition(data, sourceNode, 150);

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
  let x = 600 + Math.random() * 200 - 100;
  let y = 600 + Math.random() * 200 - 100;

  if (sourceNode) {
    x = sourceNode.position.x + 150 + Math.random() * 50;
    y = sourceNode.position.y + 100 + (Math.random() * 50 - 25);
  }

  return { id, type: 'text', position: { x, y }, data: { text, label: 'INSIGHT', animationEffect: 'annotation' } };
};

export const createProjectNode = (id: string, data: any, sourceNode?: Node): Node => {
  const { x, y } = calculateNodePosition(data, sourceNode, 200);

  return {
    id,
    type: 'project',
    position: { x, y },
    data: {
      title: data.title,
      summary: data.summary,
      role: data.role,
      year: data.year,
      image: data.image
    }
  };
};

export const createEdge = (source: string, target: string): Edge => {
  return { id: `e-${source}-${target}`, source, target };
};
