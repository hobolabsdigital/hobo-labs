"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from "@xyflow/react";
import { NodeHandles } from './NodeHandles';
import { motion, AnimatePresence } from "framer-motion";
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';

/** Individual log line with typewriter effect */
function DossierLine({ text, isActive, delay = 0 }: { text: string; isActive: boolean; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(delay === 0);

  // Delayed start
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setStarted(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  // Typewriter effect
  useEffect(() => {
    if (!started) return;
    if (displayText.length >= text.length) {
      setIsComplete(true);
      return;
    }
    const timer = setTimeout(() => {
      setDisplayText(text.slice(0, displayText.length + 1));
    }, 20);
    return () => clearTimeout(timer);
  }, [displayText, text, started]);

  if (!started) return null;

  return (
    <div className="flex items-start gap-2 font-mono text-xs leading-relaxed">
      <span className="text-green-500/60 select-none shrink-0">&gt;</span>
      <span className="text-green-400/90">
        {displayText}
        {!isComplete && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="inline-block w-[6px] h-[12px] bg-green-400 ml-[1px] align-middle"
          />
        )}
        {isComplete && text.includes('✓') && (
          <span className="text-green-400 ml-1">✓</span>
        )}
      </span>
    </div>
  );
}

/** Animated progress bar for the rewriting phase */
function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Stall at 90% until complete
        return prev + Math.random() * 15;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const filled = Math.floor((progress / 100) * 10);
  const empty = 10 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  return (
    <div className="flex items-start gap-2 font-mono text-xs leading-relaxed">
      <span className="text-green-500/60 select-none shrink-0">&gt;</span>
      <span className="text-green-400/90">
        REWRITING EDITORIAL... <span className="text-green-500/70">{bar}</span>
      </span>
    </div>
  );
}

/** Scanline overlay effect */
function Scanlines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)',
      }}
    />
  );
}

export const DossierNode = React.memo(function DossierNode({ id, data }: { id: string; data: any }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dossierStatus = useCanvasStore(state => state.dossierStatus);
  const dossierSlug = useCanvasStore(state => state.dossierSlug);
  const dossierTitle = useCanvasStore(state => state.dossierTitle);
  const activeDossierId = useCanvasStore(state => state.activeDossierId);

  const isActive = activeDossierId === id;
  const status = isActive ? dossierStatus : data.finalStatus || 'complete';
  const slug = isActive ? dossierSlug : data.slug;
  const title = isActive ? dossierTitle : data.title;

  // Auto-collapse 2 seconds after completion
  useEffect(() => {
    if (status === 'complete') {
      const timer = setTimeout(() => setIsCollapsed(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Collapsed badge
  if (isCollapsed) {
    return (
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1 }}
        className="cursor-pointer"
        onClick={() => setIsCollapsed(false)}
      >
        <NodeHandles />
        <div className="bg-black/90 border border-green-500/30 px-4 py-2 font-mono text-[10px] text-green-400/80 tracking-widest uppercase hover:border-green-500/60 transition-colors">
          [ ✓ CASE FILE: {(slug || '').toUpperCase()} ]
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative bg-black/95 border border-green-500/20 shadow-[0_0_30px_rgba(0,255,0,0.05)] overflow-hidden"
      style={{ width: '400px' }}
    >
      {/* Scanline overlay */}
      <Scanlines />

      {/* Connection Handles */}
      <NodeHandles />

      {/* Header */}
      <div className="border-b border-green-500/20 px-4 py-3 flex items-center justify-between">
        <div className="font-mono text-[10px] text-green-500/50 tracking-[0.3em] uppercase">
          SUB-AGENT TERMINAL
        </div>
        <motion.div
          animate={{ opacity: status === 'complete' ? 1 : [0.3, 1, 0.3] }}
          transition={status === 'complete' ? {} : { repeat: Infinity, duration: 1.5 }}
          className={`w-2 h-2 rounded-full ${status === 'complete' ? 'bg-green-400' : 'bg-green-500/70'}`}
        />
      </div>

      {/* Terminal body */}
      <div className="px-4 py-4 flex flex-col gap-2 min-h-[80px]">
        {/* Line 1: Accessing */}
        {(status === 'accessing' || status === 'source-loaded' || status === 'rewriting' || status === 'complete') && (
          <DossierLine
            text={`ACCESSING CASE FILE: ${(slug || '').toUpperCase()}`}
            isActive={status === 'accessing'}
          />
        )}

        {/* Line 2: Source loaded */}
        {(status === 'source-loaded' || status === 'rewriting' || status === 'complete') && (
          <DossierLine
            text={`SOURCE DATA LOADED: ${title || slug} ✓`}
            isActive={status === 'source-loaded'}
            delay={200}
          />
        )}

        {/* Line 3: Rewriting (with progress bar) */}
        {status === 'rewriting' && <ProgressBar />}
        {status === 'complete' && (
          <DossierLine
            text="EDITORIAL REWRITE COMPLETE ✓"
            isActive={false}
            delay={0}
          />
        )}

        {/* Line 4: Complete */}
        {status === 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 pt-2 border-t border-green-500/20"
          >
            <DossierLine
              text="DOSSIER COMPLETE — RENDERING CARD"
              isActive={false}
              delay={300}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});
