"use client";

import React, { useEffect, useRef } from 'react';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { HeroNode } from './nodes/HeroNode';
import { TextNode } from './nodes/TextNode';
import { PromptNode } from './nodes/PromptNode';
import { GhostNode } from './nodes/GhostNode';
import { ProjectNode } from './nodes/ProjectNode';
import { IntroNode } from './nodes/IntroNode';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: Record<string, React.ComponentType<any>> = {
  hero: HeroNode,
  text: TextNode,
  prompt: PromptNode,
  ghost: GhostNode,
  project: ProjectNode,
  intro: IntroNode
};

export function MobileStreamView() {
  const nodes = useCanvasStore(state => state.nodes);
  const isIntroAnimationFinished = useCanvasStore(state => state.isIntroAnimationFinished);
  const isIntroReasoningFinished = useCanvasStore(state => state.isIntroReasoningFinished);
  const timeCursor = useCanvasStore(state => state.timeCursor);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const isIntroActive = !(isIntroAnimationFinished && isIntroReasoningFinished);

  // Auto-scroll to bottom on new node or streaming text updates
  useEffect(() => {
    if (isIntroActive) return;

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return; // Skip scrolling on the very first reveal
    }

    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [nodes, isIntroActive]);

  return (
    <div className={`w-full h-full overflow-y-auto overflow-x-hidden p-4 pt-32 pb-40 flex flex-col gap-12 scroll-smooth transition-opacity duration-1000 ease-in-out ${isIntroActive ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto bg-transparent'}`}>
      {!isIntroActive && nodes.map((node, index) => {
        if (node.type === 'intro') return null;

        const Component = nodeTypes[node.type || 'text'];
        if (!Component) return null;

        const isPastCursor = timeCursor !== null && index > timeCursor;

        return (
          <div
            key={node.id}
            className={`w-full flex flex-col items-start relative transition-opacity duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-4 ${isPastCursor ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto bg-transparent'}`}
          >
            <Component data={node.data} id={node.id} />
          </div>
        );
      })}
      <div ref={bottomRef} className="h-4 w-full" />
    </div>
  );
}
