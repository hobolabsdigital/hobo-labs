import { create } from 'zustand';

export type CrtMode = 'standard' | 'experimental' | null; // null = not chosen yet

export interface CrtConfig {
  enabled: boolean;
  // Barrel distortion / CRT curvature
  barrelStrength: number;    // 0-100, CRT curvature intensity percentage
  // Chromatic aberration
  aberrationOffset: number;  // 0-5px, RGB channel split
  // Vignette
  vignetteStrength: number;  // 0-1, darkness at edges
  vignetteRadius: number;    // 0.2-1.0, how far vignette extends
  // Film grain
  grainOpacity: number;      // 0-0.3, noise intensity
  grainSpeed: number;        // 0.5-5, animation speed
  // Rounded corners (experimental shader)
  cornerRadius: number;      // 0-0.5, corner rounding
  edgeSoftness: number;      // 0-0.3, softness of corner fade
  topDarken: number;         // 0-1, how much to darken the top
}

interface CrtStore {
  crtConfig: CrtConfig;
  setCrtConfig: (partial: Partial<CrtConfig>) => void;
  isCrtPanelOpen: boolean;
  setCrtPanelOpen: (open: boolean) => void;
  // CRT mode: standard (CSS overlay), experimental (drawElementImage), null (not chosen)
  crtMode: CrtMode;
  setCrtMode: (mode: CrtMode) => void;
  // Whether drawElementImage is supported in this browser
  experimentalSupported: boolean;
  setExperimentalSupported: (supported: boolean) => void;
}

export const DEFAULT_CRT_CONFIG: CrtConfig = {
  enabled: true,
  barrelStrength: 10,
  aberrationOffset: 1.8,
  vignetteStrength: 0.36,
  vignetteRadius: 0.75,
  grainOpacity: 0.115,
  grainSpeed: 1.5,
  cornerRadius: 0.18,
  edgeSoftness: 0.12,
  topDarken: 0.65,
};

export const useCrtStore = create<CrtStore>((set) => ({
  crtConfig: { ...DEFAULT_CRT_CONFIG },
  setCrtConfig: (partial) =>
    set((state) => ({
      crtConfig: { ...state.crtConfig, ...partial },
    })),
  isCrtPanelOpen: false,
  setCrtPanelOpen: (open) => set({ isCrtPanelOpen: open }),
  crtMode: null,
  setCrtMode: (mode) => set({ crtMode: mode }),
  experimentalSupported: false,
  setExperimentalSupported: (supported) => set({ experimentalSupported: supported }),
}));

/**
 * Detect if drawElementImage is available (requires Chrome flag).
 * Must be called client-side.
 */
export function detectDrawElementImage(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const tc = document.createElement("canvas");
    tc.setAttribute("layoutsubtree", "");
    const ctx = tc.getContext("2d");
    return ctx !== null && typeof (ctx as any).drawElementImage === "function";
  } catch {
    return false;
  }
}
