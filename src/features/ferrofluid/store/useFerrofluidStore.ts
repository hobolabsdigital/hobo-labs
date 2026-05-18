import { create } from 'zustand';

export interface FerrofluidConfig {
  noiseSpeed: number;
  noiseScale: number;
  spikeHeight: number;
  audioMultiplier: number;
  cameraZ: number;
  zoomAmount: number;
  parallaxAmount: number;
  orbitAmount: number;
  enableMouseTracking: boolean;
  mouseInfluence: number;
  mousePullStrength: number;
  canvasOpacity: number;
  dofStrength: number;
  focusDistance: number;
  blendMode: string;
}

export const DEFAULT_FERROFLUID_CONFIG: FerrofluidConfig = {
  noiseSpeed: 0.001,
  noiseScale: 1.3,
  spikeHeight: 0.37,
  audioMultiplier: 1.2,
  cameraZ: 6.0,
  zoomAmount: 3.2,
  parallaxAmount: 1.0,
  orbitAmount: 1.5,
  enableMouseTracking: true,
  mouseInfluence: 0.7,
  mousePullStrength: 0.8,
  canvasOpacity: 0.3,
  dofStrength: 2.0,
  focusDistance: 6.0,
  blendMode: 'normal'
};

interface FerrofluidStore {
  config: FerrofluidConfig;
  setConfig: (config: Partial<FerrofluidConfig>) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  toggleAudioFn: (() => void) | null;
  setToggleAudioFn: (fn: (() => void) | null) => void;
}

export const useFerrofluidStore = create<FerrofluidStore>((set) => ({
  config: { ...DEFAULT_FERROFLUID_CONFIG },
  setConfig: (newConfig) => set((state) => ({ config: { ...state.config, ...newConfig } })),
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  toggleAudioFn: null,
  setToggleAudioFn: (fn) => set({ toggleAudioFn: fn }),
}));
