"use client";

import { useState } from 'react';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { INTRO_REVEAL_CLASSES } from '@/features/canvas/constants';
import { useTheme, type AppTheme } from '@/core/theme/theme-provider';
import { useFerrofluidStore } from '@/features/ferrofluid/store/useFerrofluidStore';
import { Section } from './debug/Section';
import { CrtDebugControls } from './debug/CrtDebugControls';
import { FluidDebugControls } from './debug/FluidDebugControls';
import { FerrofluidDebugControls } from './debug/FerrofluidDebugControls';

const THEME_OPTIONS: { value: AppTheme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'blueprint', label: 'Blueprint // Real' },
  { value: 'cyberpunk', label: 'Cyber // Punk' },
  { value: 'brutalist', label: 'Brut // Al' },
  { value: 'retro', label: 'Retro // 70s' },
];


export function DebugPanel() {
  const isDebugDrawerOpen = useCanvasStore(state => state.isDebugDrawerOpen);
  const setDebugDrawerOpen = useCanvasStore(state => state.setDebugDrawerOpen);
  const nodes = useCanvasStore(state => state.nodes);
  const edges = useCanvasStore(state => state.edges);

  const isIntroAnimationFinished = useCanvasStore(state => state.isIntroAnimationFinished);

  const { theme, setTheme } = useTheme();

  const isPlaying = useFerrofluidStore(s => s.isPlaying);
  const toggleAudioFn = useFerrofluidStore(s => s.toggleAudioFn);

  return (
    <div className={`fixed top-8 right-0 z-50 ${INTRO_REVEAL_CLASSES} ${!isIntroAnimationFinished ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      } ${isDebugDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="absolute right-[100%] top-0 mr-4 flex gap-2">
        <button
          onClick={() => toggleAudioFn?.()}
          className="bg-[var(--foreground)] text-[var(--background)] px-3 py-1 text-xs font-ui hover:bg-opacity-80 transition-all duration-300 whitespace-nowrap"
          title={isPlaying ? "Pause Audio" : "Play Audio"}
        >
          {isPlaying ? '[ 🔊 ]' : '[ 🔇 ]'}
        </button>
        <button
          onClick={() => setDebugDrawerOpen(!isDebugDrawerOpen)}
          className="bg-[var(--foreground)] text-[var(--background)] px-3 py-1 text-xs font-ui hover:bg-opacity-80 transition-all duration-300 whitespace-nowrap"
        >
          [ PLAYGROUND ]
        </button>
      </div>

      <div className="bg-[var(--background)] border border-[var(--foreground)] border-r-0 p-4 shadow-2xl flex flex-col gap-3 font-ui w-80 h-auto max-h-[90vh] overflow-y-auto">

        {/* Theme — always open */}
        <Section title="Theme" defaultOpen>
          <div className="grid grid-cols-2 gap-1">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`px-2 py-1.5 text-[10px] uppercase tracking-wider border transition-colors ${theme === opt.value
                  ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                  : 'bg-transparent text-[var(--foreground)] border-[var(--foreground)]/30 hover:border-[var(--foreground)]'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Section>

        <CrtDebugControls />
        <FluidDebugControls />
        <FerrofluidDebugControls />

        {/* Stats */}
        <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-1">
          <div>Nodes: {nodes.length}</div>
          <div>Edges: {edges.length}</div>
        </div>
      </div>
    </div>
  );
}
