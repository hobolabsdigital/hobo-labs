"use client";

import React, { useState } from 'react';
import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";
import { useCanvasStore } from '@/store/useCanvasStore';

export const GhostNode = React.memo(function GhostNode({ id, data }: { id: string, data: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFinished = data.isFinished;
  
  // Decoupled streaming state! Only re-renders this component!
  const streamedText = useCanvasStore(state => state.activeGhostId === id ? state.activeGhostText : null);
  const textToDisplay = streamedText !== null ? streamedText : data.text;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`max-w-md p-6 bg-[var(--background)] relative border-l-4 border-dashed border-foreground/30 ${isFinished ? 'opacity-50' : 'opacity-80'}`}
    >
      {['top', 'right', 'bottom', 'left'].map(pos => {
        const positionEnum = pos === 'top' ? Position.Top : pos === 'right' ? Position.Right : pos === 'bottom' ? Position.Bottom : Position.Left;
        return (
          <React.Fragment key={pos}>
            <Handle type="target" position={positionEnum} id={pos} className="opacity-0" />
            <Handle type="source" position={positionEnum} id={pos} className="opacity-0" />
          </React.Fragment>
        );
      })}
      
      <div className="flex flex-col gap-4">
        <motion.div 
          animate={!isFinished ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
          transition={!isFinished ? { repeat: Infinity, duration: 2 } : {}}
          onClick={() => isFinished && setIsExpanded(!isExpanded)}
          className={`font-mono text-xs font-bold uppercase tracking-widest self-start px-2 py-1 ${isFinished ? 'bg-foreground/5 text-foreground/50 cursor-pointer hover:bg-foreground/10' : 'bg-foreground/10 text-foreground'}`}
        >
          {isFinished ? (isExpanded ? '[ - REASONING ]' : '[ + REASONING ]') : '[ THINKING... ]'}
        </motion.div>
        
        {(!isFinished || isExpanded) && (
          <p className="text-lg font-mono text-foreground/50 leading-snug whitespace-pre-wrap break-words">
            {textToDisplay || "..."}
          </p>
        )}
      </div>
    </motion.div>
  );
});
