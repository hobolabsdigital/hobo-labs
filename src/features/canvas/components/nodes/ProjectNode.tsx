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

  const displayContent = content || summary;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-transparent origin-center flex flex-col"
        style={{ width: '1000px' }}
      >
        {/* Top Architectural Meta Bar */}
        <div className="flex items-center justify-between border-b border-foreground/20 pb-4 mb-10">
          <div className="flex gap-8 font-mono text-[9px] tracking-[0.2em] text-foreground/50 uppercase">
            <span>STUDIO / {year || new Date().getFullYear()}</span>
            <span>INDEX N° 26</span>
            <span>TYPE: <strong className="text-foreground">CASE_STUDY</strong></span>
          </div>
          <div className="flex gap-8 font-mono text-[9px] tracking-[0.2em] text-foreground/50 uppercase">
            <span>LAT. 52.5200° N</span>
            <span>LON. 13.4050° E</span>
          </div>
        </div>

        {/* Main Grid Spread */}
        <div className="grid grid-cols-12 gap-10 relative">
          
          {/* Left Column: Typography & Article */}
          <div className="col-span-6 flex flex-col pt-4">
            <h2 className="text-6xl md:text-[5.5rem] font-serif leading-[0.9] tracking-tight mb-8 text-foreground" style={{ hyphens: 'auto' }}>
              {title}<span className="text-[#E03C31]">.</span>
            </h2>

            <h3 className="text-2xl font-serif italic text-foreground/80 mb-10 leading-snug pr-8 border-l-2 border-[#E03C31] pl-6 ml-1">
              {summary}
            </h3>

            <div className="text-sm font-sans font-light text-foreground/80 leading-[1.8] border-t border-foreground/20 pt-8 max-w-md">
              {displayContent.split('\n\n').slice(0, 2).map((para: string, i: number) => (
                 <p key={i} className="mb-6">{para}</p>
              ))}
            </div>
            
            {/* Tech Stack integrated into the left column to anchor it */}
            {techStack.length > 0 && (
              <div className="mt-8 border-t border-foreground/20 pt-8 max-w-md">
                <h4 className="text-[9px] font-mono tracking-widest text-foreground/50 mb-6 uppercase">SYSTEMS & ARCHITECTURE</h4>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-foreground/5 border border-foreground/10 text-foreground/80 font-mono text-[9px] tracking-widest uppercase">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Graphic Hero Image */}
          <div className="col-span-6 relative flex flex-col justify-start">
            
            <div className="relative w-full max-w-[440px] ml-auto">
              {/* Solid Geometric Offset Block */}
              <div className="absolute top-8 -left-8 w-full h-full bg-[#E03C31] opacity-90" />
              
              {/* Fine Wireframe Box Offset */}
              <div className="absolute -top-6 -right-6 w-full h-full border border-foreground/30" />

              {/* Main Image (No padding, sits seamlessly) */}
              {image ? (
                <div className="relative z-10 w-full aspect-[4/5] bg-muted border border-foreground/10 shadow-xl overflow-hidden">
                  <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                </div>
              ) : (
                <div className="relative z-10 w-full aspect-[4/5] border border-dashed border-foreground/30 flex items-center justify-center font-mono text-xs text-foreground/30 bg-foreground/5">
                  [ VISUAL ASSET PENDING ]
                </div>
              )}
              
              {/* Image Annotations */}
              <div className="absolute -bottom-6 left-0 font-mono text-[9px] tracking-[0.2em] text-foreground/50 uppercase">
                FIG. 01 — {title.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Lower Grid: Gallery */}
        {resolvedGallery.length > 0 && (
          <div className="mt-20 pt-10 border-t border-foreground/20">
            <div className="flex items-center gap-4 mb-8">
              <span className="font-mono text-[9px] tracking-[0.2em] text-foreground/50 uppercase">VISUAL ARCHIVE</span>
              <div className="flex-1 h-[1px] bg-foreground/10" />
            </div>
            
            <div className="grid grid-cols-4 gap-6">
              {resolvedGallery.slice(0, 4).map((img: string, i: number) => (
                <div key={i} className="flex flex-col gap-3 group">
                  <div className="relative w-full aspect-square border border-foreground/10 overflow-hidden bg-muted">
                    <img src={img} alt={`Gallery ${i}`} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                  </div>
                  <div className="flex justify-between items-center border-b border-foreground/10 pb-2">
                    <span className="font-mono text-[9px] tracking-widest text-foreground/50 uppercase">PLATE {String(i + 1).padStart(2, '0')}</span>
                  </div>
                </div>
              ))}
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
