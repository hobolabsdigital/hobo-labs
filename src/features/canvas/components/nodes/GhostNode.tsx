"use client";

import React, { useState } from 'react';
import { NodeHandles } from './NodeHandles';
import { motion } from "framer-motion";
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';

const GhostText = React.memo(function GhostText({ id, fallbackText, isFinished, isExpanded }: { id: string, fallbackText: string, isFinished: boolean, isExpanded: boolean }) {
  // Decoupled streaming state! Only re-renders this tiny text component, saving Framer Motion from dying!
  const streamedText = useCanvasStore(state => state.activeGhostId === id ? state.activeGhostText : null);
  const textToDisplay = streamedText !== null ? streamedText : fallbackText;
  const textRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom during streaming so latest reasoning is visible
  React.useEffect(() => {
    if (!isFinished && textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [textToDisplay, isFinished]);

  // Finished + collapsed = show nothing (badge only)
  if (isFinished && !isExpanded) return null;

  // Finished + expanded = scrollable full text
  if (isFinished && isExpanded) {
    return (
      <div
        ref={textRef}
        style={{ maxHeight: '300px', overflowY: 'auto' }}
        className="text-lg font-ui text-foreground/50 leading-snug whitespace-pre-wrap break-words"
      >
        {textToDisplay || "..."}
      </div>
    );
  }

  // Active streaming = constrained viewport with top-fade
  return (
    <div
      ref={textRef}
      style={{
        maxHeight: '160px',
        overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)',
      }}
      className="text-lg font-ui text-foreground/50 leading-snug whitespace-pre-wrap break-words"
    >
      {textToDisplay || "..."}
    </div>
  );
});

export const GhostNode = React.memo(function GhostNode({ id, data }: { id: string, data: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFinished = data.isFinished;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`max-w-md p-6 relative ${isFinished ? 'bg-[var(--background)] opacity-50' : 'bg-foreground/5 animate-pulse opacity-80'}`}
    >
      <NodeHandles />
      
      <div className="flex flex-col gap-4">
        <motion.div 
          animate={!isFinished ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
          transition={!isFinished ? { repeat: Infinity, duration: 2 } : {}}
          onClick={() => isFinished && setIsExpanded(!isExpanded)}
          className={`font-ui text-xs font-bold uppercase tracking-widest self-start px-2 py-1 ${isFinished ? 'bg-foreground/5 text-foreground/50 cursor-pointer hover:bg-foreground/10' : 'bg-foreground/10 text-foreground'}`}
        >
          {isFinished ? (isExpanded ? '[ - REASONING ]' : '[ + REASONING ]') : '[ THINKING... ]'}
        </motion.div>
        
        <GhostText id={id} fallbackText={data.text} isFinished={isFinished} isExpanded={isExpanded} />
      </div>
    </motion.div>
  );
});
