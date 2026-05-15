"use client";

import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
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
      className="relative bg-background origin-center flex flex-col shadow-2xl border border-foreground/10"
      style={{ width: '800px' }}
    >
      <NodeHandles />
      <div className="w-full aspect-video bg-foreground/5 flex items-center justify-center overflow-hidden relative">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="font-mono text-xs text-foreground/30 uppercase tracking-widest"
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

  const { object, submit, error, isLoading } = useObject({
    api: '/api/project-context',
    schema: z.object({ problem: z.string(), solution: z.string(), quote: z.string() }),
    onFinish: (result: any) => {
      console.log('[DEBUG-NODE] useObject onFinish:', result);
      updateNodeData(reactFlowId, { ...result.object, isContextStreaming: false });
    },
    onError: (err) => {
      console.error('[DEBUG-NODE] useObject error:', err);
    }
  });

  const hasSubmitted = React.useRef(false);

  React.useEffect(() => {
    console.log(`[DEBUG-NODE] ${data.slug} isContextStreaming:`, data.isContextStreaming, 'problem:', data.problem);
    if (data.isContextStreaming && !data.problem && !hasSubmitted.current) {
      console.log(`[DEBUG-NODE] Submitting useObject for ${data.slug}`);
      hasSubmitted.current = true;
      submit({ slug: data.slug, messages: [] });
    }
  }, [data.isContextStreaming, data.slug, data.problem, submit]);

  React.useEffect(() => {
    if (object) {
      console.log(`[DEBUG-NODE] useObject streaming object for ${data.slug}:`, object);
      updateNodeData(reactFlowId, object);
    }
  }, [object, reactFlowId, updateNodeData]);

  React.useEffect(() => {
    if (error) {
      console.error(`[DEBUG-NODE] Error streaming for ${data.slug}:`, error);
    }
  }, [error, data.slug]);

  if (data.isLoading) return <ProjectSkeleton />;

  const title = (data.title as string) || "UNTITLED PROJECT";
  const id = (data.id as string) || title;
  const role = (data.role as string) || '';
  const year = (data.year as string) || String(new Date().getFullYear());
  const image = (data.image as string) || null;
  const quote = (data.quote as string) || (data.summary as string) || '';
  const isStreaming = data.isContextStreaming as boolean;
  const heroSrc = (image && (image.startsWith('http') || image.startsWith('/'))) ? image : '/portfolio/placeholder.png';

  const handleHeroClick = () => {
    useProjectModalStore.getState().open(reactFlowId, heroSrc);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="project-node-card relative bg-background origin-center flex flex-col shadow-2xl border border-foreground/10 group"
        style={{ width: '800px' }}
      >
        <NodeHandles />

        {/* Hero image — click opens portal overlay */}
        <div
          className="w-full aspect-video overflow-visible bg-transparent relative cursor-pointer"
          onClick={handleHeroClick}
        >
          <motion.img
            layoutId={`project-hero-${id}`}
            src={heroSrc}
            alt={title}
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        <div className="p-8 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-sans font-medium tracking-tight text-foreground">{title}</h2>
            <span className="font-mono text-xs text-foreground/40">{year}</span>
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-foreground/50">{role}</p>
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
