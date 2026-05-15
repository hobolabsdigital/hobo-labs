import { create } from 'zustand';

export interface ProjectModalState {
  isOpen: boolean;
  animationPhase: 'idle' | 'opening' | 'open' | 'closing';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projectData: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  open: (data: any) => void;
  close: () => void;
  setAnimationPhase: (phase: ProjectModalState['animationPhase']) => void;
}

export const useProjectModalStore = create<ProjectModalState>((set) => ({
  isOpen: false,
  animationPhase: 'idle',
  projectData: null,
  open: (data) => set({ isOpen: true, animationPhase: 'opening', projectData: data }),
  close: () => set({ isOpen: false, animationPhase: 'idle', projectData: null }),
  setAnimationPhase: (phase) => {
    set(() => {
      if (phase === 'idle') {
        return { animationPhase: 'idle', isOpen: false };
      }
      return { animationPhase: phase };
    });
  },
}));
