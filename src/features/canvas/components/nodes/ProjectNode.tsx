"use client";

import React from 'react';
import { Handle, Position } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";

export const ProjectNode = React.memo(function ProjectNode({ data, id }: { data: any, id: string }) {
  const title = data.title || "UNTITLED PROJECT";
  const summary = data.summary || "Project summary not provided.";
  const content = data.content;
  const role = data.role;
  const year = data.year;
  const image = data.image || null;
  const gallery = data.gallery || [];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-[var(--background)] origin-top-left border-4 border-foreground shadow-[16px_16px_0px_0px_var(--foreground)]"
        style={{ width: '900px' }}
      >
        {/* Top Header - Bauhaus inverted block */}
        <div className="border-b-4 border-foreground p-8 flex justify-between items-end bg-foreground text-background">
          <h2 className="text-7xl font-sans font-bold leading-[0.85] tracking-tighter uppercase w-2/3 break-words">
            {title}
          </h2>
          <div className="flex flex-col text-right font-mono text-sm tracking-widest uppercase gap-2">
            {role && <span>ROLE // {role}</span>}
            {year && <span>YEAR // {year}</span>}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-0">
          {/* Left Column: Main Content */}
          <div className="col-span-8 border-r-4 border-foreground flex flex-col">
            {image && (
              <div className="w-full aspect-[16/9] border-b-4 border-foreground overflow-hidden bg-muted">
                <img src={image} alt={title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
              </div>
            )}
            
            <div className="p-8">
              <h3 className="text-3xl font-serif font-medium leading-tight mb-8">
                {summary}
              </h3>
              {content ? (
                <div className="columns-2 gap-8 text-foreground/80 font-sans text-sm leading-relaxed">
                  {content.split('\n\n').map((para: string, i: number) => (
                    <p key={i} className="mb-4">{para}</p>
                  ))}
                </div>
              ) : (
                <div className="w-full h-32 bg-foreground/5 flex items-center justify-center">
                  <span className="font-mono text-xs uppercase tracking-widest text-foreground/50">[NO ARTICLE CONTENT]</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar & Gallery */}
          <div className="col-span-4 flex flex-col bg-muted/10 relative">
            {/* Geometric Bauhaus accent block */}
            <div className="w-full h-24 bg-[#E03C31] border-b-4 border-foreground" />
            
            {gallery.length > 0 ? (
              gallery.map((img: string, i: number) => (
                <div key={i} className="w-full aspect-square border-b-4 border-foreground overflow-hidden">
                  <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                </div>
              ))
            ) : (
              // Filler block if no gallery
              <div className="w-full aspect-square border-b-4 border-foreground flex items-center justify-center p-8 bg-muted/20">
                 <div className="w-32 h-32 rounded-full bg-[#00509E]" />
              </div>
            )}
            
            <div className="flex-1 min-h-[100px]" />
            <div className="w-full h-16 bg-[#F9D616] border-t-4 border-foreground" />
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
