"use client";

import React from 'react';
import { Handle, Position } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";

export const ProjectNode = React.memo(function ProjectNode({ data, id }: { data: any, id: string }) {
  const title = data.title || "UNTITLED PROJECT";
  const summary = data.summary || "Project summary not provided.";
  const role = data.role;
  const year = data.year;
  const image = data.image || null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative flex flex-col items-start bg-transparent origin-top-left"
        style={{ minWidth: '400px' }}
      >
        <div className="mb-6">
          {title.split(' ').map((word: string, i: number) => (
             <h2 key={i} className="text-6xl md:text-8xl font-sans font-medium text-foreground leading-[0.85] tracking-tighter uppercase whitespace-nowrap">
               {word}
             </h2>
          ))}
        </div>

        {image && (
          <div 
            className="mt-2 w-80 h-56 md:w-[480px] md:h-[320px] relative overflow-hidden" 
            style={{ 
              borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
              boxShadow: "10px -10px 0px 0px var(--foreground)"
            }}
          >
            <img src={image} alt={title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
          </div>
        )}

        <div className="mt-8 max-w-md">
          <div className="flex gap-4 mb-4">
            {role && (
              <span className="font-mono text-sm text-foreground/70 uppercase tracking-widest">
                [ROLE: {role}]
              </span>
            )}
            {year && (
              <span className="font-mono text-sm text-foreground/70 uppercase tracking-widest">
                [YEAR: {year}]
              </span>
            )}
            {!(role || year) && (
              <span className="font-mono text-sm text-foreground/70 uppercase tracking-widest">
                [PROJECT OVERVIEW]
              </span>
            )}
          </div>
          <p className="font-sans text-xl leading-relaxed text-foreground">
            {summary}
          </p>
        </div>

        {/* Connection Handles */}
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
    </AnimatePresence>
  );
});
