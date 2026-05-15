import { create } from 'zustand';

export interface ProjectModalState {
  isOpen: boolean;
  animationPhase: 'idle' | 'opening' | 'open' | 'closing';
  activeNodeId: string | null;
  heroSrc: string | null;
  open: (nodeId: string, heroSrc: string) => void;
  close: () => void;
  setAnimationPhase: (phase: ProjectModalState['animationPhase']) => void;
}

export const useProjectModalStore = create<ProjectModalState>((set) => ({
  isOpen: false,
  animationPhase: 'idle',
  activeNodeId: null,
  heroSrc: null,
  open: (nodeId, heroSrc) => set({ isOpen: true, animationPhase: 'opening', activeNodeId: nodeId, heroSrc }),
  close: () => set({ isOpen: false, animationPhase: 'idle', activeNodeId: null, heroSrc: null }),
  setAnimationPhase: (phase) => {
    set(() => {
      if (phase === 'idle') {
        return { animationPhase: 'idle', isOpen: false };
      }
      return { animationPhase: phase };
    });
  },
}));
