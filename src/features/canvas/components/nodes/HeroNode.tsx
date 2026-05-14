"use client";

import React from 'react';
import { Handle, Position } from "@xyflow/react";
import { NodeHandles } from './NodeHandles';
import { motion, AnimatePresence } from "framer-motion";

export const HeroNode = React.memo(function HeroNode({ data, id }: { data: any, id: string }) {
  const rawHeadline = data.headline || data.title || "THE\nCREATIVE\nENGINE";
  const headlineLines = rawHeadline.replace(/\\n/g, '\n').split('\n');

  const typewriterContainer = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  
  const typewriterChar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.01 } }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ y: '100vh', opacity: 0, rotate: 15, transition: { duration: 0.6, ease: 'easeIn' } }}
        className="relative flex flex-col items-start bg-transparent origin-bottom-left"
        style={{ maxWidth: '900px' }}
      >
        <motion.div className="mb-4" variants={typewriterContainer} initial="hidden" animate="visible">
          {headlineLines.map((line: string, i: number) => (
            <h1 key={i} className="text-7xl md:text-9xl font-sans font-medium text-foreground leading-[0.85] tracking-tighter uppercase" style={{ overflowWrap: 'break-word' }}>
              {line.split('').map((char, charIdx) => (
                <motion.span key={charIdx} variants={typewriterChar}>{char}</motion.span>
              ))}
            </h1>
          ))}
        </motion.div>

        {data.imageUrl && (
          <div 
            className="mt-6 w-72 h-48 md:w-96 md:h-64 relative overflow-hidden" 
            style={{ 
              borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
              boxShadow: "10px 10px 0px 0px var(--color-accent-lime)"
            }}
          >
            <img src={data.imageUrl} alt="mask" className="w-full h-full object-cover" />
          </div>
        )}

        {data.subline && (
          <div className="mt-8 max-w-sm">
            <p className="font-mono text-sm text-foreground/70 uppercase tracking-widest mb-2">[OVERVIEW]</p>
            <motion.p variants={typewriterContainer} initial="hidden" animate="visible" className="font-sans text-xl leading-relaxed text-foreground">
              {data.subline.split('').map((char: string, charIdx: number) => (
                <motion.span key={charIdx} variants={typewriterChar}>{char}</motion.span>
              ))}
            </motion.p>
          </div>
        )}

        <NodeHandles />
      </motion.div>
    </AnimatePresence>
  );
});
