"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useBeeStore } from '../store/useBeeStore';
import { motion, AnimatePresence } from 'framer-motion';

export function SwarmTerminal() {
  const terminalText = useBeeStore(state => state.terminalText);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (bottomRef.current && !isCollapsed) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalText, isCollapsed]);

  if (!terminalText) return null;

  return (
    <AnimatePresence>
      <motion.div 
        drag
        dragMomentum={false}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-24 right-6 md:left-6 md:right-auto z-[999] w-80 bg-black/90 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col pointer-events-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        <div 
          className="uppercase tracking-widest text-[10px] text-white/50 p-3 border-b border-white/20 flex justify-between items-center cursor-move"
          onDoubleClick={() => setIsCollapsed(!isCollapsed)}
        >
          <span>Swarm Mind</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hover:text-white transition-colors cursor-pointer pointer-events-auto"
            >
              {isCollapsed ? '[ EXPAND ]' : '[ COLLAPSE ]'}
            </button>
            <span className="animate-pulse block w-2 h-2 bg-white rounded-full"></span>
          </div>
        </div>
        
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 text-xs font-mono text-white/90 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {terminalText}
                  <span className="animate-pulse inline-block w-2 h-3 bg-white ml-1 align-middle"></span>
                </div>
                <div ref={bottomRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
