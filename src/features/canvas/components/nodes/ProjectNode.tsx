"use client";

import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { NodeHandles } from './NodeHandles';

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

// --- Compact Skeleton (matches compact card layout) ---
function ProjectSkeleton() {
  return (
    <div
      className="relative bg-background origin-center flex flex-col shadow-2xl border border-foreground/10"
      style={{ width: '800px' }}
    >
      <NodeHandles />
      {/* Image skeleton */}
      <div className="w-full aspect-video bg-foreground/5 flex items-center justify-center overflow-hidden relative">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="font-mono text-xs text-foreground/30 uppercase tracking-widest"
        >
          LOADING ASSET
        </motion.div>
      </div>
      {/* Metadata skeleton */}
      <div className="p-8 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Shimmer className="h-7 w-2/3 rounded" />
          <Shimmer className="h-4 w-12 rounded" />
        </div>
        <Shimmer className="h-3 w-1/4 rounded" />
        <Shimmer className="h-4 w-5/6 rounded mt-2" />
      </div>
    </div>
  );
}

// --- Compact Card (the only visual state — expand will be a future WebGL modal) ---
export const ProjectNode = React.memo(function ProjectNode({ data, id }: { data: any, id: string }) {
  // Skeleton mode
  if (data.isLoading) {
    return <ProjectSkeleton />;
  }

  const title = data.title || "UNTITLED PROJECT";
  const role = data.role || '';
  const year = data.year || String(new Date().getFullYear());
  const image = data.image || null;
  const quote = data.quote || data.summary || '';
  const heroSrc = image || '/portfolio/placeholder.png';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-background origin-center flex flex-col shadow-2xl border border-foreground/10 cursor-pointer group"
        style={{ width: '800px' }}
      >
        <NodeHandles />
        <div className="w-full aspect-video overflow-hidden bg-foreground/5">
          <img
            src={heroSrc}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
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
    </AnimatePresence>
  );
});
