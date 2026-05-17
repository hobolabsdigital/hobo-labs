"use client";

import React, { useMemo, useState } from 'react';
import { NodeHandles } from './NodeHandles';
import { motion, AnimatePresence } from "framer-motion";

import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';

const VISIBLE_COLS = 3;

function ParagraphBlock({ text }: { text: string }) {
  return (
    <p className="text-base font-body text-foreground leading-relaxed whitespace-pre-wrap">
      {text}
    </p>
  );
}

export const TextNode = React.memo(function TextNode({ data, id }: { data: any, id: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const streamedText = useCanvasStore(state => state.activeStreamingTextId === id ? state.activeStreamingText : null);
  const rawContent = streamedText !== null ? streamedText : (data.text || "Text content");

  // Split into paragraphs — double newline, or fall back to single newline for long blocks
  const paragraphs = useMemo(() => {
    const split = rawContent.split(/\n\n+/).map((p: string) => p.trim()).filter(Boolean);
    // If only 1 paragraph but it's very long, split by single newlines
    if (split.length === 1 && split[0].length > 300) {
      const bySingle = rawContent.split(/\n/).map((p: string) => p.trim()).filter(Boolean);
      if (bySingle.length > 1) return bySingle;
    }
    return split;
  }, [rawContent]);

  const hasOverflow = paragraphs.length > VISIBLE_COLS;
  const visibleParagraphs = isExpanded ? paragraphs : paragraphs.slice(0, VISIBLE_COLS);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ y: '100vh', opacity: 0, rotate: -15, transition: { duration: 0.6, ease: 'easeIn' } }}
        className="relative bg-transparent origin-bottom-right"
        style={{ width: paragraphs.length === 1 ? '360px' : `${Math.min(paragraphs.length, VISIBLE_COLS) * 280 + (Math.min(paragraphs.length, VISIBLE_COLS) - 1) * 16 + 48}px` }}
      >
        <NodeHandles />

        {/* Label */}
        {data.label && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="font-ui text-xs font-bold uppercase tracking-widest bg-foreground text-background self-start px-2 py-1 mb-4 inline-block"
          >
            {data.label}
          </motion.div>
        )}

        {/* Paragraphs grid */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${Math.min(paragraphs.length, VISIBLE_COLS)}, 1fr)` }}
        >
          {visibleParagraphs.map((p: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              className="border-l-2 border-foreground/20 pl-4"
            >
              <ParagraphBlock text={p} />
            </motion.div>
          ))}
        </div>

        {/* Expand / Collapse toggle */}
        {hasOverflow && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 font-ui text-[10px] text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors cursor-pointer w-full text-right"
          >
            {isExpanded ? '[ COLLAPSE ]' : `[ +${paragraphs.length - VISIBLE_COLS} MORE ]`}
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
});
