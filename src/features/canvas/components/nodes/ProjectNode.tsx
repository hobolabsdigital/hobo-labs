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
        className="relative flex flex-col bg-transparent origin-top-left"
        style={{ minWidth: '380px', maxWidth: '440px' }}
      >
        <div className="border border-[var(--foreground)] bg-[var(--background)] overflow-hidden shadow-[8px_8px_0px_0px_var(--foreground)]">
          {/* Image Header 16:9 */}
          <div className="aspect-video border-b border-[var(--foreground)] flex items-center justify-center bg-[var(--muted)]/20 relative overflow-hidden">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
            ) : (
              <span className="font-mono text-sm text-[var(--foreground)]/50 tracking-widest">[NO IMAGE]</span>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6">
            <h3 className="font-serif text-3xl font-medium tracking-tight mb-4 uppercase">{title}</h3>
            
            {(role || year) && (
              <div className="flex gap-4 mb-4">
                {role && (
                  <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.12em] border border-[var(--border)] px-2 py-1">
                    ROLE: {role}
                  </span>
                )}
                {year && (
                  <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.12em] border border-[var(--border)] px-2 py-1">
                    YEAR: {year}
                  </span>
                )}
              </div>
            )}

            <p className="font-sans text-sm leading-relaxed text-[var(--foreground)]/80">
              {summary}
            </p>
          </div>
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
