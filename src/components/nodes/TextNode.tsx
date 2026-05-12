"use client";

import React from 'react';
import { Handle, Position } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";
import { AnnotationText } from "../ui/annotation-text";
import { IrisText } from "../ui/iris-text";
import { useBeeStore } from '../../store/useBeeStore';
import { useCanvasStore } from '@/store/useCanvasStore';

const EMPTY_OBJECT = {};

export const TextNode = React.memo(function TextNode({ data, id }: { data: any, id: string }) {
  const streamedText = useCanvasStore(state => state.activeStreamingTextId === id ? state.activeStreamingText : null);
  const content = streamedText !== null ? streamedText : (data.text || "Text content");

  const workerTarget = useBeeStore(state => state.swarmTarget.worker);
  const soldierTarget = useBeeStore(state => state.swarmTarget.soldier);
  
  const isWorkerTarget = workerTarget === 'global' || workerTarget === id;
  const isSoldierTarget = soldierTarget === 'global' || soldierTarget === id;
  
  const workerStyles = useBeeStore(state => isWorkerTarget ? state.themeOverrides.worker : EMPTY_OBJECT);
  const soldierStyles = useBeeStore(state => isSoldierTarget ? state.themeOverrides.soldier : EMPTY_OBJECT);
  
  const nodeStyles = { ...workerStyles, ...soldierStyles };

  const typewriterContainer = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  
  const typewriterChar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.01 } }
  };

  let renderText = (
    <motion.p 
      variants={typewriterContainer}
      initial="hidden"
      animate="visible"
      className="text-2xl font-sans text-foreground leading-snug whitespace-pre-wrap"
    >
      {content.split('').map((char: string, charIdx: number) => (
        <motion.span key={charIdx} variants={typewriterChar}>{char}</motion.span>
      ))}
    </motion.p>
  );

  if (data.animationEffect === 'annotation') {
    renderText = (
      <p className="text-2xl font-sans text-foreground leading-snug whitespace-pre-wrap">
        <AnnotationText type="underline" delay={0.5}>{content}</AnnotationText>
      </p>
    );
  } else if (data.animationEffect === 'iris') {
    renderText = (
      <p className="text-2xl font-sans text-foreground leading-snug whitespace-pre-wrap">
        <IrisText text={content} delay={0.2} />
      </p>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={JSON.stringify(nodeStyles)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ y: '100vh', opacity: 0, rotate: -15, transition: { duration: 0.6, ease: 'easeIn' } }}
        className="max-w-md p-6 bg-[var(--background)] relative border-l-2 border-foreground origin-bottom-right"
        style={nodeStyles}
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
          
          {renderText}
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
