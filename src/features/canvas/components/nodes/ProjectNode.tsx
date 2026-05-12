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
  const techStack = data.techStack || [];
  
  // Fallback gallery resolution if AI hasn't provided it yet
  let resolvedGallery = data.gallery || [];
  if (resolvedGallery.length === 0) {
    const t = title.toLowerCase();
    if (t.includes("monstory")) {
      resolvedGallery = ["/portfolio/Monstory-01.png", "/portfolio/Monstory-02.png", "/portfolio/Monstory-03.png", "/portfolio/Monstory-04.png"];
    } else if (t.includes("mazda")) {
      resolvedGallery = ["/portfolio/Find-My-Mazda-01.png", "/portfolio/Find-My-Mazda-02.png", "/portfolio/Find-My-Mazda-03.png", "/portfolio/Find-My-Mazda-04.png"];
    } else if (t.includes("wagner")) {
      resolvedGallery = ["/portfolio/Wagner-Piza-01.png", "/portfolio/Wagner-Piza-02.png"];
    } else if (t.includes("woozle")) {
      resolvedGallery = ["/portfolio/Woozle-Goozle-01.png", "/portfolio/Woozle-Goozle-02.png"];
    } else if (t.includes("moxis")) {
      resolvedGallery = ["/portfolio/Xitrust-Moxis-01.png", "/portfolio/Xitrust-Moxis-02.png", "/portfolio/Xitrust-Moxis-03.png", "/portfolio/Xitrust-Moxis-04.png"];
    } else if (t.includes("innovation")) {
      resolvedGallery = ["/portfolio/Innovation-Summit-01.png", "/portfolio/Innovation-Summit-02.png", "/portfolio/Innovation-Summit-03.png", "/portfolio/Innovation-Summit-04.png"];
    } else if (t.includes("oceana")) {
      resolvedGallery = ["/portfolio/Oceana-01.png", "/portfolio/Oceana-02.png"];
    }
  }

  // Parse content to show everything
  const displayContent = content || summary;
  const paragraphs = displayContent.split('\n\n').filter((p: string) => p.trim().length > 0);
  
  // Distribute paragraphs for the zigzag layout
  const block1Paras = paragraphs.slice(0, 2);
  const block2Paras = paragraphs.slice(2, 4);
  const block3Paras = paragraphs.slice(4);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-transparent origin-center flex flex-col gap-12"
        style={{ width: '1100px' }}
      >
        {/* HEADER: Continuous Sans-Serif Typography */}
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-end border-b border-foreground/20 pb-6">
            <h2 className="text-7xl md:text-[6.5rem] font-sans font-medium uppercase tracking-tighter leading-[0.85] text-foreground max-w-[80%]">
              {title}
            </h2>
            <div className="text-right">
              <p className="font-mono text-[10px] tracking-[0.2em] text-foreground/50 uppercase mb-2">
                SELECTED WORK — {year || new Date().getFullYear()}
              </p>
              {role && (
                <p className="font-sans text-xs uppercase tracking-widest text-foreground/70 font-medium">
                  {role}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-12 justify-between">
            <h3 className="text-2xl md:text-3xl font-sans font-light text-foreground/90 max-w-2xl leading-[1.3] tracking-tight">
              {summary}
            </h3>
            {techStack.length > 0 && (
              <div className="flex flex-wrap justify-end gap-2 max-w-xs h-fit">
                {techStack.map((tech: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 rounded-full border border-foreground/20 text-foreground/80 font-mono text-[9px] tracking-widest uppercase bg-background/50 backdrop-blur-sm">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ZIGZAG ROW 1: Main Image (Left) + Text Block 1 (Right) */}
        <div className="grid grid-cols-12 gap-12 items-center mt-6">
          <div className="col-span-8">
            <div className="w-full aspect-video overflow-hidden rounded-[2rem] shadow-2xl relative group">
              {image ? (
                <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center border border-dashed border-foreground/30 font-mono text-xs text-foreground/30">
                  [ VISUAL ASSET PENDING ]
                </div>
              )}
            </div>
          </div>
          <div className="col-span-4">
            <div className="prose prose-invert max-w-none">
              {block1Paras.map((para: string, i: number) => (
                <p key={i} className="font-sans text-base text-foreground/70 leading-[1.8] mb-6 font-light">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* ZIGZAG ROW 2: Text Block 2 (Left) + Gallery Image 1 (Right) */}
        {(block2Paras.length > 0 || resolvedGallery.length > 0) && (
          <div className="grid grid-cols-12 gap-12 items-center mt-12">
            <div className="col-span-5">
              <div className="prose prose-invert max-w-none">
                {block2Paras.length > 0 ? (
                  block2Paras.map((para: string, i: number) => (
                    <p key={i} className="font-sans text-base text-foreground/70 leading-[1.8] mb-6 font-light">
                      {para}
                    </p>
                  ))
                ) : (
                  <div className="h-full border-t border-foreground/10 pt-4 font-mono text-[10px] text-foreground/30 uppercase tracking-widest">
                    [ END OF ARTICLE ]
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-7">
              {resolvedGallery[0] && (
                <div className="w-full aspect-video overflow-hidden rounded-[2rem] shadow-2xl relative group">
                  <img src={resolvedGallery[0]} alt={`${title} Gallery 1`} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ZIGZAG ROW 3: Remaining Content & Gallery Images */}
        {(block3Paras.length > 0 || resolvedGallery.length > 1) && (
          <div className="grid grid-cols-12 gap-12 items-start mt-12 mb-12">
            <div className="col-span-6 flex flex-col gap-12">
              {resolvedGallery[1] && (
                <div className="w-full aspect-video overflow-hidden rounded-[2rem] shadow-2xl relative group">
                  <img src={resolvedGallery[1]} alt={`${title} Gallery 2`} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                </div>
              )}
              {block3Paras.length > 0 && (
                <div className="prose prose-invert max-w-none mt-4">
                  {block3Paras.map((para: string, i: number) => (
                    <p key={i} className="font-sans text-base text-foreground/70 leading-[1.8] mb-6 font-light">
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            <div className="col-span-6 flex flex-col gap-12">
              {resolvedGallery[2] && (
                <div className="w-full aspect-video overflow-hidden rounded-[2rem] shadow-2xl relative group mt-24">
                  <img src={resolvedGallery[2]} alt={`${title} Gallery 3`} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                </div>
              )}
              {resolvedGallery[3] && (
                <div className="w-full aspect-video overflow-hidden rounded-[2rem] shadow-2xl relative group">
                  <img src={resolvedGallery[3]} alt={`${title} Gallery 4`} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                </div>
              )}
            </div>
          </div>
        )}

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
