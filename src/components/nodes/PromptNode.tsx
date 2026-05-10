"use client";

import React from 'react';
import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";

export function PromptNode({ data }: { data: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.4 }}
      className="max-w-xs p-5 bg-foreground text-background relative shadow-2xl rounded-2xl"
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
      
      <div className="flex flex-col gap-2">
        <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-background/70 border-b border-background/20 pb-1">
          [ PROMPT ]
        </div>
        <p className="text-sm font-sans leading-snug whitespace-pre-wrap">
          {data.text}
        </p>
      </div>
    </motion.div>
  );
}
