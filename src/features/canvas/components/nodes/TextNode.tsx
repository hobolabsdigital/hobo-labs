"use client";

import React, { useMemo, useState } from 'react';
import { Handle, Position } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { AnnotationText } from '@/core/ui/components/annotation-text';
import { IrisText } from '@/core/ui/components/iris-text';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';

const typewriterContainer = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const typewriterChar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } }
};

const StreamingTextContent = React.memo(function StreamingTextContent({ id, fallbackText, animationEffect }: { id: string, fallbackText: string, animationEffect?: string }) {
  const streamedText = useCanvasStore(state => state.activeStreamingTextId === id ? state.activeStreamingText : null);
  const content = streamedText !== null ? streamedText : (fallbackText || "Text content");

  // Memoize the character array to prevent insane GC pressure when adding one character at a time
  const chars = useMemo(() => content.split(''), [content]);

  if (animationEffect === 'annotation') {
    return (
      <p className="text-2xl font-sans text-foreground leading-snug whitespace-pre-wrap">
        <AnnotationText type="underline" delay={0.5}>{content}</AnnotationText>
      </p>
    );
  } else if (animationEffect === 'iris') {
    return (
      <p className="text-2xl font-sans text-foreground leading-snug whitespace-pre-wrap">
        <IrisText text={content} delay={0.2} />
      </p>
    );
  }

  // Standard typewriter effect
  return (
    <motion.p 
      variants={typewriterContainer}
      initial="hidden"
      animate="visible"
      className="text-2xl font-sans text-foreground leading-snug whitespace-pre-wrap"
    >
      {chars.map((char: string, charIdx: number) => (
        <motion.span key={charIdx} variants={typewriterChar}>{char}</motion.span>
      ))}
    </motion.p>
  );
});

export const TextNode = React.memo(function TextNode({ data, id }: { data: any, id: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ y: '100vh', opacity: 0, rotate: -15, transition: { duration: 0.6, ease: 'easeIn' } }}
        className="max-w-md p-6 bg-[var(--background)] relative border-l-2 border-foreground origin-bottom-right cursor-pointer group"
        style={isExpanded ? {} : {
          maxHeight: '280px',
          overflow: 'hidden',
          WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
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
          {data.label && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-mono text-xs font-bold uppercase tracking-widest bg-foreground text-background self-start px-2 py-1"
            >
              {data.label}
            </motion.div>
          )}
          
          <StreamingTextContent id={id} fallbackText={data.text} animationEffect={data.animationEffect} />
        </div>

        {/* Expand/collapse hint */}
        {!isExpanded && (
          <div className="absolute bottom-2 right-4 font-mono text-[10px] text-foreground/30 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            [ EXPAND ]
          </div>
        )}
        {isExpanded && (
          <div className="font-mono text-[10px] text-foreground/30 uppercase tracking-widest mt-4 text-right">
            [ COLLAPSE ]
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});
