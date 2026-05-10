"use client";

import React from 'react';
import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";
import { AnnotationText } from "../ui/annotation-text";
import { IrisText } from "../ui/iris-text";

export function TextNode({ data }: { data: any }) {
  const content = data.text || "Text content";

  let renderText = (
    <motion.p 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="text-2xl font-sans text-foreground leading-snug whitespace-pre-wrap"
    >
      {content}
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.3 }}
      className="max-w-md p-6 bg-[var(--background)] relative border-l-2 border-foreground"
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
  );
}
