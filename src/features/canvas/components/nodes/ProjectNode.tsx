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
  const techStack = data.techStack || [];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-[var(--background)] origin-center border border-foreground/20 shadow-2xl"
        style={{ width: '1000px' }}
      >
        {/* Magazine Cover / Header Section */}
        <div className="grid grid-cols-12 gap-0 border-b border-foreground/20">
          {/* Title Area */}
          <div className="col-span-8 p-12 flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-foreground/50 uppercase mb-4">
                Selected Case Study — {year || new Date().getFullYear()}
              </p>
              <h2 className="text-6xl md:text-7xl font-serif font-medium leading-[0.9] tracking-tight uppercase mb-6 break-words">
                {title}
              </h2>
              <h3 className="text-2xl font-sans font-light text-foreground/80 leading-snug max-w-2xl">
                {summary}
              </h3>
            </div>
            
            {(role || techStack.length > 0) && (
              <div className="mt-12 flex flex-wrap gap-x-12 gap-y-6 border-t border-foreground/10 pt-6">
                {role && (
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.15em] text-foreground/40 mb-2">ROLE</p>
                    <p className="font-sans text-sm uppercase tracking-wider">{role}</p>
                  </div>
                )}
                {techStack.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.15em] text-foreground/40 mb-2">TECH STACK</p>
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-foreground/5 text-foreground/70 font-mono text-[10px] tracking-widest uppercase">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Main Hero Image */}
          <div className="col-span-4 border-l border-foreground/20 relative overflow-hidden bg-foreground/5 min-h-[300px]">
            {image ? (
              <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-foreground/30">[NO IMAGE]</div>
            )}
          </div>
        </div>

        {/* Editorial Body */}
        <div className="grid grid-cols-12 gap-0">
          {/* Left Column: Article Text */}
          <div className="col-span-7 p-12 pr-16 border-r border-foreground/20">
             {content ? (
                <div className="prose prose-invert max-w-none">
                  {content.split('\n\n').map((para: string, i: number) => {
                    const isFirst = i === 0;
                    return (
                      <p key={i} className={`font-sans text-base text-foreground/80 leading-[1.8] mb-6 font-light ${isFirst ? 'mt-2' : ''}`}>
                        {isFirst && para.length > 0 ? (
                          <span className="float-left text-6xl font-serif leading-[0.8] mr-3 mt-1 text-foreground">{para.charAt(0)}</span>
                        ) : null}
                        {isFirst ? para.substring(1) : para}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full h-32 flex items-center">
                  <span className="font-mono text-xs uppercase tracking-widest text-foreground/50">[NO ARTICLE CONTENT PROVIDED]</span>
                </div>
              )}
          </div>

          {/* Right Column: Image Gallery Layout */}
          <div className="col-span-5 flex flex-col bg-foreground/[0.02]">
            {gallery.length > 0 ? (
              <div className="grid grid-cols-1 grid-rows-[repeat(auto-fit,minmax(250px,1fr))] h-full">
                {gallery.slice(0, 3).map((img: string, i: number) => (
                  <div key={i} className={`relative min-h-[250px] overflow-hidden ${i !== gallery.length - 1 ? 'border-b border-foreground/20' : ''}`}>
                    <img src={img} alt={`Gallery ${i}`} className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 hover:scale-100" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12">
                <p className="font-mono text-[10px] tracking-widest text-foreground/40 text-center uppercase leading-loose border border-foreground/10 p-6">
                  [RESERVED FOR VISUAL ASSETS]
                </p>
              </div>
            )}
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
