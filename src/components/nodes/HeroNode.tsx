"use client";

import React from 'react';
import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";

export function HeroNode({ data }: { data: any }) {
  // Use headline from data.headline (created by LLM) or fallback to data.title
  const rawHeadline = data.headline || data.title || "THE\nCREATIVE\nENGINE";
  const headlineLines = rawHeadline.replace(/\\n/g, '\n').split('\n');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.3 }}
      className="relative flex flex-col items-start bg-transparent"
    >
      {/* Massive Brutalist Typography */}
      <div className="mb-4">
        {headlineLines.map((line: string, i: number) => (
          <h1 key={i} className="text-7xl md:text-9xl font-sans font-medium text-foreground leading-[0.85] tracking-tighter uppercase whitespace-nowrap">
            {line}
          </h1>
        ))}
      </div>

      {/* Floating Organic Mask for Image */}
      {data.imageUrl && (
        <div 
          className="mt-6 w-72 h-48 md:w-96 md:h-64 relative overflow-hidden" 
          style={{ 
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", // Organic blob mask
            boxShadow: "10px 10px 0px 0px var(--color-accent-lime)" // Brutalist offset shadow
          }}
        >
          <img src={data.imageUrl} alt="mask" className="w-full h-full object-cover" />
        </div>
      )}

      {data.subline && (
        <div className="mt-8 max-w-sm">
          <p className="font-mono text-sm text-foreground/70 uppercase tracking-widest mb-2">[OVERVIEW]</p>
          <p className="font-sans text-xl leading-relaxed text-foreground">{data.subline}</p>
        </div>
      )}

      {['top', 'right', 'bottom', 'left'].map(pos => {
        const positionEnum = pos === 'top' ? Position.Top : pos === 'right' ? Position.Right : pos === 'bottom' ? Position.Bottom : Position.Left;
        return (
          <React.Fragment key={pos}>
            <Handle type="target" position={positionEnum} id={pos} className="opacity-0" />
            <Handle type="source" position={positionEnum} id={pos} className="opacity-0" />
          </React.Fragment>
        );
      })}
    </motion.div>
  );
}
