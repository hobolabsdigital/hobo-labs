"use client";

import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";

export function TextNode({ data }: { data: any }) {
  // Split text into words for a staggered reveal effect
  const words = typeof data.label === 'string' ? data.label.split(" ") : ["Text"];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-2xl px-4 py-2 relative">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <motion.h1 
        variants={container}
        initial="hidden"
        animate="show"
        className="text-5xl md:text-7xl font-sans font-medium tracking-tighter text-foreground leading-[0.9]"
      >
        {words.map((word: string, i: number) => (
          <motion.span key={i} variants={item} className="inline-block mr-3">
            {word}
          </motion.span>
        ))}
      </motion.h1>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
