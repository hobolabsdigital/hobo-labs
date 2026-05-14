"use client";

import React, { useState, useEffect } from 'react';
import { Handle, Position } from "@xyflow/react";
import { NodeHandles } from './NodeHandles';
import { motion, AnimatePresence } from "framer-motion";

// --- Shimmer block for skeleton mode ---
function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-foreground/5 ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.07] to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
      />
    </div>
  );
}

// --- Typewriter text component ---
function TypewriterText({
  text,
  speed = 25,
  delay = 0,
  className,
  onComplete,
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}) {
  const [displayText, setDisplayText] = useState('');
  const [started, setStarted] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setStarted(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayText.length >= text.length) {
      onComplete?.();
      return;
    }
    const timer = setTimeout(() => {
      setDisplayText(text.slice(0, displayText.length + 1));
    }, speed);
    return () => clearTimeout(timer);
  }, [displayText, text, speed, started, onComplete]);

  if (!started) return <span className={className}>&nbsp;</span>;

  return (
    <span className={className}>
      {displayText}
      {displayText.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="inline-block w-[2px] h-[1em] bg-foreground/60 ml-[1px] align-baseline"
        />
      )}
    </span>
  );
}

// --- Fade-in wrapper for staggered reveals ---
function FadeIn({ delay = 0, children, className }: { delay?: number; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- Skeleton State ---
function ProjectSkeleton() {
  return (
    <div className="relative bg-background p-12 origin-center flex flex-col gap-10 shadow-2xl border border-foreground/10" style={{ width: '800px' }}>
      {/* Header skeleton */}
      <div className="flex flex-col gap-3">
        <Shimmer className="h-4 w-1/3 rounded" />
        <Shimmer className="h-12 w-2/3 rounded mt-2" />
        <Shimmer className="h-5 w-1/4 rounded mt-1" />
      </div>

      {/* Image skeleton */}
      <div className="w-full aspect-video border border-foreground/10 bg-foreground/5 flex items-center justify-center overflow-hidden relative">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="font-mono text-xs text-foreground/30 uppercase tracking-widest"
        >
          LOADING ASSET
        </motion.div>
      </div>

      {/* Metadata table skeleton */}
      <div className="w-full flex flex-col border border-foreground/10">
        {[1, 2, 3].map(i => (
          <div key={i} className={`flex justify-between items-center p-4 ${i < 3 ? 'border-b border-foreground/10' : ''}`}>
            <Shimmer className="h-3 w-16 rounded" />
            <Shimmer className="h-4 w-32 rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="flex flex-col gap-4">
        <Shimmer className="h-4 w-full rounded" />
        <Shimmer className="h-4 w-5/6 rounded" />
        <Shimmer className="h-4 w-full rounded" />
        <Shimmer className="h-4 w-3/4 rounded" />
      </div>

      {/* Tech stack skeleton */}
      <div className="flex gap-3">
        {[1, 2, 3, 4].map(i => (
          <Shimmer key={i} className="h-8 w-20 rounded" />
        ))}
      </div>

      {/* Handles */}
      <NodeHandles />
    </div>
  );
}

// --- Compact Card ---
function ProjectCompact({ title, role, year, image, quote, onClick }: {
  title: string; role: string; year: string; image: string | null; quote: string; onClick: () => void;
}) {
  const heroSrc = image || '/portfolio/placeholder.png';
  return (
    <motion.div
      layout
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-background origin-center flex flex-col shadow-2xl border border-foreground/10 cursor-pointer group"
      style={{ width: '800px' }}
    >
      <NodeHandles />
      <div className="w-full aspect-video overflow-hidden bg-foreground/5">
        <img src={heroSrc} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      </div>
      <div className="p-8 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-sans font-medium tracking-tight text-foreground">{title}</h2>
          <span className="font-mono text-xs text-foreground/40">{year}</span>
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-foreground/50">{role}</p>
        {quote && <p className="text-base text-foreground/60 leading-relaxed line-clamp-2 italic mt-2">&ldquo;{quote}&rdquo;</p>}
        <div className="font-mono text-xs text-foreground/30 uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">[ CLICK TO EXPAND ]</div>
      </div>
    </motion.div>
  );
}

// --- Main ProjectNode ---
export const ProjectNode = React.memo(function ProjectNode({ data, id }: { data: any, id: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Skeleton mode
  if (data.isLoading) {
    return <ProjectSkeleton />;
  }

  const title = data.title || "UNTITLED PROJECT";
  const summary = data.summary || "Project summary not provided.";
  const content = data.content;
  const role = data.role;
  const year = data.year;
  const image = data.image || null;
  const techStack = data.techStack || [];
  const isRevealing = data.isRevealing || false;
  
  const problem = data.problem || "";
  const solution = data.solution || "";
  const quote = data.quote || "";

  // Fallback gallery resolution
  let resolvedGallery = data.gallery || [];
  if (resolvedGallery.length === 0) {
    const t = title.toLowerCase();
    if (t.includes("monstory")) resolvedGallery = ["/portfolio/Monstory-01.png", "/portfolio/Monstory-02.png", "/portfolio/Monstory-03.png", "/portfolio/Monstory-04.png"];
    else if (t.includes("mazda")) resolvedGallery = ["/portfolio/Find-My-Mazda-01.png", "/portfolio/Find-My-Mazda-02.png", "/portfolio/Find-My-Mazda-03.png", "/portfolio/Find-My-Mazda-04.png"];
    else if (t.includes("wagner")) resolvedGallery = ["/portfolio/Wagner-Piza-01.png", "/portfolio/Wagner-Piza-02.png"];
    else if (t.includes("woozle")) resolvedGallery = ["/portfolio/Woozle-Goozle-01.png", "/portfolio/Woozle-Goozle-02.png"];
    else if (t.includes("moxis")) resolvedGallery = ["/portfolio/Xitrust-Moxis-01.png", "/portfolio/Xitrust-Moxis-02.png", "/portfolio/Xitrust-Moxis-03.png", "/portfolio/Xitrust-Moxis-04.png"];
    else if (t.includes("innovation")) resolvedGallery = ["/portfolio/Innovation-Summit-01.png", "/portfolio/Innovation-Summit-02.png", "/portfolio/Innovation-Summit-03.png", "/portfolio/Innovation-Summit-04.png"];
    else if (t.includes("oceana")) resolvedGallery = ["/portfolio/Oceana-01.png", "/portfolio/Oceana-02.png"];
  }

  // If revealing (dossier animation), force expanded
  const showExpanded = isExpanded || isRevealing;

  // Compact mode
  if (!showExpanded) {
    return (
      <ProjectCompact
        title={title}
        role={role || ''}
        year={year || String(new Date().getFullYear())}
        image={image}
        quote={quote}
        onClick={() => setIsExpanded(true)}
      />
    );
  }

  // Parse content for expanded view
  const displayContent = content || summary;
  const paragraphs = displayContent.split('\n\n').filter((p: string) => p.trim().length > 0);

  // Stagger delay base (only applies when isRevealing)
  const d = isRevealing ? 1 : 0;
  const BASE = 200;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-background p-12 origin-center flex flex-col gap-10 shadow-2xl border border-foreground/10"
        style={{ width: '800px', maxHeight: '900px', overflowY: 'auto' }}
      >
        {/* Collapse button */}
        {!isRevealing && (
          <button
            onClick={() => setIsExpanded(false)}
            className="self-end font-mono text-xs uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors px-2 py-1"
          >
            [ COLLAPSE ]
          </button>
        )}

        {/* Header Section */}
        <FadeIn delay={0}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 text-xs font-mono text-foreground/50 uppercase tracking-widest mb-2">
              {isRevealing ? (
                <TypewriterText text={title} speed={35} className="" />
              ) : (
                <span>{title}</span>
              )}
              <span>{year || new Date().getFullYear()}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-sans font-medium tracking-tight text-foreground">
              {isRevealing ? (
                <TypewriterText text={title} speed={40} delay={d * BASE} />
              ) : (
                title
              )}
            </h2>
            {role && (
              <p className="text-lg font-sans text-foreground/60">
                {isRevealing ? (
                  <TypewriterText text={role} speed={30} delay={d * BASE * 2} />
                ) : (
                  role
                )}
              </p>
            )}
          </div>
        </FadeIn>

        {/* Main Image Container */}
        <FadeIn delay={d * BASE * 3}>
          <div className="w-full aspect-video border border-foreground/10 bg-foreground/5 flex items-center justify-center overflow-hidden relative">
            {image ? (
              <motion.img
                src={image}
                alt={title}
                initial={isRevealing ? { opacity: 0 } : { opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: isRevealing ? 0.3 : 0 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <span className="font-mono text-xs text-foreground/40 uppercase tracking-widest">
                HERO UI ASSET
              </span>
            )}
          </div>
        </FadeIn>

        {/* Metadata Table */}
        <FadeIn delay={d * BASE * 4}>
          <div className="w-full flex flex-col border border-foreground/10">
            <div className="flex justify-between items-center p-4 border-b border-foreground/10">
              <span className="font-mono text-[10px] uppercase text-foreground/50 tracking-widest">TITLE</span>
              <span className="font-sans text-sm font-medium text-foreground/90">
                {isRevealing ? <TypewriterText text={title} speed={25} delay={d * BASE * 4.5} /> : title}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 border-b border-foreground/10">
              <span className="font-mono text-[10px] uppercase text-foreground/50 tracking-widest">YEAR</span>
              <span className="font-sans text-sm font-medium text-foreground/90">{year || new Date().getFullYear()}</span>
            </div>
            {role && (
              <div className="flex justify-between items-center p-4">
                <span className="font-mono text-[10px] uppercase text-foreground/50 tracking-widest">ROLE</span>
                <span className="font-sans text-sm font-medium text-foreground/90">
                  {isRevealing ? <TypewriterText text={role} speed={25} delay={d * BASE * 5} /> : role}
                </span>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Article Content */}
        <div className="flex flex-col gap-6">
          {paragraphs.map((para: string, i: number) => (
            <FadeIn key={i} delay={d * BASE * (6 + i)}>
              <p className="font-sans text-base text-foreground/80 leading-[1.8] font-light">
                {isRevealing ? (
                  <TypewriterText text={para} speed={8} delay={d * BASE * (6 + i)} />
                ) : (
                  para
                )}
              </p>
            </FadeIn>
          ))}
        </div>

        {/* Tech Stack Row */}
        {techStack.length > 0 && (
          <FadeIn delay={d * BASE * (6 + paragraphs.length + 1)}>
            <div className="flex flex-wrap gap-3 mt-2">
              {techStack.map((tech: string, i: number) => (
                <motion.span
                  key={i}
                  initial={isRevealing ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: isRevealing ? (d * BASE * (7 + paragraphs.length) + i * 100) / 1000 : 0, duration: 0.3 }}
                  className="px-4 py-2 border border-foreground/20 text-foreground/80 font-mono text-[10px] tracking-widest uppercase bg-transparent"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Gallery Grid */}
        {resolvedGallery.length > 0 && (
          <FadeIn delay={d * BASE * (8 + paragraphs.length)}>
            <div className="grid grid-cols-2 gap-6 mt-4">
              {resolvedGallery.slice(0, 2).map((img: string, i: number) => (
                <div key={i} className="relative aspect-[4/3] border border-foreground/10 bg-foreground/5 flex items-center justify-center overflow-hidden">
                  <motion.img
                    src={img}
                    alt={`Gallery ${i}`}
                    initial={isRevealing ? { opacity: 0 } : { opacity: 1 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: isRevealing ? (i * 300) / 1000 : 0 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Problem / Solution Blocks */}
        {(problem || solution) && (
          <FadeIn delay={d * BASE * (9 + paragraphs.length)}>
            <div className="flex flex-col gap-8 mt-6">
              {problem && (
                <div className="border-l-[3px] border-foreground pl-5 py-1">
                  <p className="font-mono text-[10px] text-foreground/60 uppercase tracking-[0.2em] mb-3">PROBLEM</p>
                  <p className="font-sans text-base text-foreground/90 leading-relaxed font-light">
                    {isRevealing ? <TypewriterText text={problem} speed={8} delay={d * BASE * (9 + paragraphs.length)} /> : problem}
                  </p>
                </div>
              )}
              {solution && (
                <div className="border-l-[3px] border-foreground pl-5 py-1">
                  <p className="font-mono text-[10px] text-foreground/60 uppercase tracking-[0.2em] mb-3">SOLUTION</p>
                  <p className="font-sans text-base text-foreground/90 leading-relaxed font-light">
                    {isRevealing ? <TypewriterText text={solution} speed={8} delay={d * BASE * (10 + paragraphs.length)} /> : solution}
                  </p>
                </div>
              )}
            </div>
          </FadeIn>
        )}

        {/* Hero Quote */}
        {quote && (
          <FadeIn delay={d * BASE * (11 + paragraphs.length)}>
            <div className="mt-8 border-t border-foreground/10 pt-10 pb-4">
              <h3 className="text-2xl font-sans font-medium leading-[1.4] tracking-tight text-foreground max-w-2xl">
                {isRevealing ? (
                  <TypewriterText text={`"${quote}"`} speed={20} delay={d * BASE * (11 + paragraphs.length)} />
                ) : (
                  `"${quote}"`
                )}
              </h3>
            </div>
          </FadeIn>
        )}

        {/* Connection Handles */}
        <NodeHandles />
      </motion.div>
    </AnimatePresence>
  );
});
