import { create } from 'zustand';

export interface CrtConfig {
  enabled: boolean;
  // Barrel distortion / CRT curvature
  barrelStrength: number;    // 0-100, CRT curvature intensity percentage
  // Vignette
  vignetteStrength: number;  // 0-1, darkness at edges
  vignetteRadius: number;    // 0.2-1.0, how far vignette extends
}

interface CrtStore {
  crtConfig: CrtConfig;
  setCrtConfig: (partial: Partial<CrtConfig>) => void;
  isCrtPanelOpen: boolean;
  setCrtPanelOpen: (open: boolean) => void;
}

export const DEFAULT_CRT_CONFIG: CrtConfig = {
  enabled: true,
  barrelStrength: 15,
  vignetteStrength: 0.34,
  vignetteRadius: 0.85,
};

export const useCrtStore = create<CrtStore>((set) => ({
  crtConfig: { ...DEFAULT_CRT_CONFIG },
  setCrtConfig: (partial) =>
    set((state) => ({
      crtConfig: { ...state.crtConfig, ...partial },
    })),
  isCrtPanelOpen: false,
  setCrtPanelOpen: (open) => set({ isCrtPanelOpen: open }),
}));
