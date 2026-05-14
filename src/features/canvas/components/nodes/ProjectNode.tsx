"use client";

import React from 'react';
import { Handle, Position } from "@xyflow/react";
import { motion, AnimatePresence } from "framer-motion";

export const ProjectNode = React.memo(function ProjectNode({ data, id }: { data: any, id: string }) {
  console.log("PROJECT NODE DATA:", data);
  const title = data.title || "UNTITLED PROJECT";
  const summary = data.summary || "Project summary not provided.";
  const content = data.content;
  const role = data.role;
  const year = data.year;
  const image = data.image || null;
  const techStack = data.techStack || [];
  
  // New AI Schema fields
  const problem = data.problem || "";
  const solution = data.solution || "";
  const quote = data.quote || "";

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

  // Parse content
  const displayContent = content || summary;
  const paragraphs = displayContent.split('\n\n').filter((p: string) => p.trim().length > 0);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-background p-12 origin-center flex flex-col gap-10 shadow-2xl border border-foreground/10"
        style={{ width: '800px' }}
      >
        {/* Header Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 text-xs font-mono text-foreground/50 uppercase tracking-widest mb-2">
            <span>{title}</span>
            <span>{year || new Date().getFullYear()}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-sans font-medium tracking-tight text-foreground">
            {title}
          </h2>
          {role && (
            <p className="text-lg font-sans text-foreground/60">
              {role}
            </p>
          )}
        </div>

        {/* Main Image Container */}
        <div className="w-full aspect-video border border-foreground/10 bg-foreground/5 flex items-center justify-center overflow-hidden relative">
          {image ? (
            <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-all duration-700" />
          ) : (
            <span className="font-mono text-xs text-foreground/40 uppercase tracking-widest">
              HERO UI ASSET
            </span>
          )}
        </div>

        {/* Metadata Table */}
        <div className="w-full flex flex-col border border-foreground/10">
          <div className="flex justify-between items-center p-4 border-b border-foreground/10">
            <span className="font-mono text-[10px] uppercase text-foreground/50 tracking-widest">TITLE</span>
            <span className="font-sans text-sm font-medium text-foreground/90">{title}</span>
          </div>
          <div className="flex justify-between items-center p-4 border-b border-foreground/10">
            <span className="font-mono text-[10px] uppercase text-foreground/50 tracking-widest">YEAR</span>
            <span className="font-sans text-sm font-medium text-foreground/90">{year || new Date().getFullYear()}</span>
          </div>
          {role && (
            <div className="flex justify-between items-center p-4">
              <span className="font-mono text-[10px] uppercase text-foreground/50 tracking-widest">ROLE</span>
              <span className="font-sans text-sm font-medium text-foreground/90">{role}</span>
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="flex flex-col gap-6">
          {paragraphs.map((para: string, i: number) => (
            <p key={i} className="font-sans text-base text-foreground/80 leading-[1.8] font-light">
              {para}
            </p>
          ))}
        </div>

        {/* Tech Stack Row */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-2">
            {techStack.map((tech: string, i: number) => (
              <span key={i} className="px-4 py-2 border border-foreground/20 text-foreground/80 font-mono text-[10px] tracking-widest uppercase bg-transparent">
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        {resolvedGallery.length > 0 && (
          <div className="grid grid-cols-2 gap-6 mt-4">
            {resolvedGallery.slice(0, 2).map((img: string, i: number) => (
              <div key={i} className="relative aspect-[4/3] border border-foreground/10 bg-foreground/5 flex items-center justify-center overflow-hidden">
                <img src={img} alt={`Gallery ${i}`} className="absolute inset-0 w-full h-full object-cover transition-all duration-700" />
                {!img && (
                  <span className="font-mono text-[10px] text-foreground/30 uppercase tracking-widest">
                    {i === 0 ? 'PLAYER CARDS' : 'TIMELINE VIEW'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Problem / Solution Blocks */}
        {(problem || solution) && (
          <div className="flex flex-col gap-8 mt-6">
            {problem && (
              <div className="border-l-[3px] border-foreground pl-5 py-1">
                <p className="font-mono text-[10px] text-foreground/60 uppercase tracking-[0.2em] mb-3">PROBLEM</p>
                <p className="font-sans text-base text-foreground/90 leading-relaxed font-light">{problem}</p>
              </div>
            )}
            {solution && (
              <div className="border-l-[3px] border-foreground pl-5 py-1">
                <p className="font-mono text-[10px] text-foreground/60 uppercase tracking-[0.2em] mb-3">SOLUTION</p>
                <p className="font-sans text-base text-foreground/90 leading-relaxed font-light">{solution}</p>
              </div>
            )}
          </div>
        )}

        {/* Hero Quote */}
        {quote && (
          <div className="mt-8 border-t border-foreground/10 pt-10 pb-4">
            <h3 className="text-2xl font-sans font-medium leading-[1.4] tracking-tight text-foreground max-w-2xl">
              "{quote}"
            </h3>
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
