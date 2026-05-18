"use client";

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { NodeHandles } from './NodeHandles';
import { useProjectModalStore } from '@/features/project-modal/store/useProjectModalStore';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';

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

// --- Compact Skeleton ---
function ProjectSkeleton() {
  return (
    <div
      className="relative bg-background origin-center flex flex-col shadow-2xl border border-foreground/10 w-full max-w-full md:max-w-none md:w-[800px]"
    >
      <NodeHandles />
      <div className="w-full aspect-video bg-foreground/5 flex items-center justify-center overflow-hidden relative">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="font-ui text-xs text-foreground/30 uppercase tracking-widest"
        >
          LOADING ASSET
        </motion.div>
      </div>
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

// --- Compact Card ---
export const ProjectNode = React.memo(function ProjectNode({ data, id: reactFlowId }: { data: Record<string, string | boolean | null | undefined>; id: string }) {
  const updateNodeData = useCanvasStore(state => state.updateNodeData);

  const hasSubmitted = React.useRef(false);
  const heroImgRef = React.useRef<HTMLImageElement>(null);

  // Fetch project context via plain JSON endpoint (no streaming protocol)
  React.useEffect(() => {
    if (data.isContextStreaming && !data.problem && !hasSubmitted.current) {
      hasSubmitted.current = true;

      fetch('/api/project-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: data.slug, messages: [] }),
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((result: Record<string, unknown>) => {
          updateNodeData(reactFlowId, { ...result, isContextStreaming: false });
        })
        .catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error('[ProjectNode] fetch error:', err);
          updateNodeData(reactFlowId, { isContextStreaming: false });
        });
    }
  }, [data.isContextStreaming, data.slug, data.problem, reactFlowId, updateNodeData]);



  if (data.isLoading) return <ProjectSkeleton />;

  const title = (data.title as string) || "UNTITLED PROJECT";
  const role = (data.role as string) || '';
  const year = (data.year as string) || String(new Date().getFullYear());
  const image = (data.image as string) || null;
  const quote = (data.quote as string) || (data.summary as string) || '';
  const isStreaming = data.isContextStreaming as boolean;
  const heroSrc = (image && (image.startsWith('http') || image.startsWith('/'))) ? image : '/portfolio/placeholder.png';

  const handleHeroClick = () => {
    const isMobile = window.innerWidth < 768;
    const rect = heroImgRef.current?.getBoundingClientRect();
    const sourceRect = rect && !isMobile ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : undefined;
    useProjectModalStore.getState().open(reactFlowId, heroSrc, sourceRect);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="project-node-card relative bg-background origin-center flex flex-col shadow-2xl border border-foreground/10 group cursor-pointer hover:border-foreground/30 transition-all duration-300 w-full max-w-full md:max-w-none md:w-[800px]"
        onClick={handleHeroClick}
        role="button"
        tabIndex={0}
        aria-label={`Open project details for ${title}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleHeroClick(); }}
      >
        <NodeHandles />

        {/* Hero image */}
        <div className="w-full aspect-video overflow-hidden bg-transparent relative">
          <Image
            ref={heroImgRef}
            src={heroSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center pointer-events-none">
            <span className="font-ui text-xs uppercase tracking-[0.25em] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/60 px-4 py-2">
              View Project →
            </span>
          </div>
        </div>

        <div className="p-8 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-heading font-medium tracking-tight text-foreground brutalist:text-[var(--brutalist-cyan)]">{title}</h2>
            <span className="font-ui text-xs text-foreground/40">{year}</span>
          </div>
          <p className="font-ui text-xs uppercase tracking-widest text-foreground/50">{role}</p>
          {isStreaming && !quote ? (
            <Shimmer className="h-4 w-3/4 rounded mt-2" />
          ) : (
            quote && <p className="text-base text-foreground/60 leading-relaxed line-clamp-2 italic mt-2">&ldquo;{quote}&rdquo;</p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
