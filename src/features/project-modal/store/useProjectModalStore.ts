import { create } from 'zustand';

export interface SourceRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProjectModalState {
  isOpen: boolean;
  animationPhase: 'idle' | 'opening' | 'open' | 'closing';
  activeNodeId: string | null;
  heroSrc: string | null;
  sourceRect: SourceRect | null;
  open: (nodeId: string, heroSrc: string, sourceRect?: SourceRect) => void;
  close: () => void;
  setAnimationPhase: (phase: ProjectModalState['animationPhase']) => void;
}

export const useProjectModalStore = create<ProjectModalState>((set) => ({
  isOpen: false,
  animationPhase: 'idle',
  activeNodeId: null,
  heroSrc: null,
  sourceRect: null,
  open: (nodeId, heroSrc, sourceRect) => set({
    isOpen: true,
    animationPhase: 'opening',
    activeNodeId: nodeId,
    heroSrc,
    sourceRect: sourceRect || null,
  }),
  close: () => set({
    isOpen: false,
    animationPhase: 'idle',
    activeNodeId: null,
    heroSrc: null,
    sourceRect: null,
  }),
  setAnimationPhase: (phase) => {
    set(() => {
      if (phase === 'idle') {
        return { animationPhase: 'idle', isOpen: false };
      }
      return { animationPhase: phase };
    });
  },
}));
