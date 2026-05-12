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

  // Ensure we have some content to display even if AI skipped it
  const displayContent = content || summary;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-transparent origin-center flex flex-col"
        style={{ width: '1200px' }}
      >
        {/* Top Architectural Meta Bar */}
        <div className="flex items-center justify-between border-b border-foreground/20 pb-4 mb-12">
          <div className="flex gap-8 font-mono text-[9px] tracking-[0.2em] text-foreground/50 uppercase">
            <span>OD / {year || new Date().getFullYear()}</span>
            <span>VOL. 01 / ISSUE N° 26</span>
            <span>FILED UNDER: <strong className="text-[#E03C31]">CASE_STUDY</strong></span>
          </div>
          <div className="flex gap-8 font-mono text-[9px] tracking-[0.2em] text-foreground/50 uppercase">
            <span>LAT. 52.5200° N</span>
            <span>LON. 13.4050° E</span>
          </div>
        </div>

        {/* Main Grid Spread */}
        <div className="grid grid-cols-12 gap-16 relative">
          
          {/* Left Column: Typography & Article */}
          <div className="col-span-6 flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <span className="w-8 h-[1px] bg-[#E03C31]" />
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#E03C31] uppercase">OPEN-SOURCE STUDIO · N° 01</span>
            </div>

            <h2 className="text-[5rem] md:text-[6rem] font-serif leading-[0.9] tracking-tighter mb-8 text-foreground break-words">
              {title.split(' ').map((word, i) => (
                <span key={i} className={i % 2 !== 0 ? "italic pr-2" : "pr-2"}>{word} </span>
              ))}
              <span className="text-[#E03C31]">.</span>
            </h2>

            <h3 className="text-2xl font-serif italic text-foreground/70 mb-12 leading-snug">
              {summary}
            </h3>

            <div className="columns-2 gap-8 text-sm font-sans font-light text-foreground/80 leading-[1.8] border-t border-foreground/20 pt-8 mt-auto">
              {displayContent.split('\n\n').slice(0, 3).map((para: string, i: number) => (
                 <p key={i} className="mb-6">{para}</p>
              ))}
            </div>
          </div>

          {/* Right Column: Graphic Collage Hero */}
          <div className="col-span-6 relative min-h-[600px] flex items-center justify-center border-l border-foreground/20 pl-16">
            {/* Top Right Corner Crosshair */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-foreground/30" />
            
            <div className="absolute top-4 left-4 font-mono text-[9px] tracking-[0.2em] text-foreground/40 uppercase">
              FIG. 01 / {title.substring(0, 4)}
            </div>

            {/* Collage Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#E03C31] rounded-full opacity-10 mix-blend-multiply blur-2xl" />
            
            {/* Offset Wireframe Box */}
            <div className="absolute top-20 right-10 w-[380px] h-[480px] border border-foreground/20 translate-x-8 translate-y-8" />
            
            {/* Geometric Dot Grid */}
            <div className="absolute top-12 left-12 w-24 h-24" style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)', backgroundSize: '8px 8px', opacity: 0.1 }} />

            {/* Main Image */}
            {image ? (
              <div className="relative z-10 w-[420px] aspect-[4/5] bg-background border border-foreground/10 shadow-2xl p-4">
                <div className="w-full h-full relative overflow-hidden bg-muted">
                  <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                </div>
                {/* Image Corner Markers */}
                <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-foreground/50" />
                <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-foreground/50" />
              </div>
            ) : (
              <div className="relative z-10 w-[420px] aspect-[4/5] border border-dashed border-foreground/30 flex items-center justify-center font-mono text-xs text-foreground/30 bg-foreground/5">
                [ VISUAL ASSET PENDING ]
              </div>
            )}

            <div className="absolute bottom-4 right-4 font-mono text-[9px] tracking-[0.2em] text-foreground/40 uppercase rotate-90 origin-bottom-right">
              COMPOSED IN <strong className="text-[#E03C31]">OPEN DESIGN</strong>
            </div>
          </div>
        </div>

        {/* Lower Grid: Systems & Gallery */}
        <div className="grid grid-cols-12 gap-16 mt-16 pt-16 border-t border-foreground/20">
          
          {/* Tech Stack / Systems */}
          <div className="col-span-4 flex flex-col gap-12">
            {techStack.length > 0 && (
              <div>
                <h4 className="text-[10px] font-mono tracking-widest text-[#E03C31] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E03C31]" /> SYSTEMS & STACK
                </h4>
                <ul className="flex flex-col gap-0 border-t border-foreground/20">
                  {techStack.map((tech: string, i: number) => (
                    <li key={i} className="flex justify-between items-center py-3 border-b border-foreground/20 group">
                      <span className="font-sans text-sm uppercase tracking-widest text-foreground/80 group-hover:text-foreground transition-colors">{tech}</span>
                      <span className="font-mono text-[9px] text-foreground/30">0{i + 1}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {role && (
              <div>
                <h4 className="text-[10px] font-mono tracking-widest text-foreground/40 mb-4 flex items-center gap-2">
                  <span className="w-1 h-1 bg-foreground/40" /> ASSIGNED ROLE
                </h4>
                <p className="font-serif text-lg italic text-foreground/80">{role}</p>
              </div>
            )}
          </div>

          {/* Gallery Spread */}
          <div className="col-span-8">
            {resolvedGallery.length > 0 && (
              <div className="grid grid-cols-3 gap-8">
                {resolvedGallery.slice(0, 3).map((img: string, i: number) => (
                  <div key={i} className="flex flex-col gap-4 group">
                    <div className="relative aspect-[3/4] border border-foreground/10 bg-muted p-2 shadow-sm transition-transform duration-500 group-hover:-translate-y-2">
                      <div className="w-full h-full relative overflow-hidden">
                        <img src={img} alt={`Gallery ${i}`} className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-1 border-t border-foreground/10 pt-2">
                      <span className="font-mono text-[9px] tracking-widest text-foreground/50 uppercase">PLATE NO.{i+2}</span>
                      <span className="font-mono text-[9px] text-foreground/30">REF_{Math.floor(Math.random()*9000)+1000}</span>
                    </div>
                  </div>
                ))}
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
