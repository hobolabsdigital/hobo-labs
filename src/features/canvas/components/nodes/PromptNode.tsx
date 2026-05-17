"use client";

import React from 'react';
import { motion } from "framer-motion";
import { NodeHandles } from './NodeHandles';

export const PromptNode = React.memo(function PromptNode({ data }: { data: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.4 }}
      className="max-w-xs p-5 bg-foreground text-background relative shadow-2xl rounded-2xl"
    >
      <NodeHandles />
      
      <div className="flex flex-col gap-2">
        <div className="font-ui text-[10px] font-bold uppercase tracking-widest text-background/70 border-b border-background/20 pb-1">
          [ PROMPT ]
        </div>
        <p className="text-sm font-body leading-snug whitespace-pre-wrap">
          {data.text}
        </p>
      </div>
    </motion.div>
  );
});
