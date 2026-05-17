import { StateCreator } from 'zustand';
import type { CanvasState } from '../useCanvasStore';

export interface FluidSlice {
  fluidConfig: {
    SPLAT_RADIUS: number;
    SPLAT_FORCE: number;
    DENSITY_DISSIPATION: number;
    VELOCITY_DISSIPATION: number;
    PRESSURE: number;
    CURL: number;
    ABERRATION_MULT: number;
    SWELL_MULT: number;
    MAGNETIC_RADIUS: number;
    SPLAT_COLOR: string;
    COLOR_CYCLE: boolean;
    COLOR_CYCLE_SPEED: number;
  };
  setFluidConfig: (config: Partial<FluidSlice['fluidConfig']>) => void;
}

export const createFluidSlice: StateCreator<CanvasState, [], [], FluidSlice> = (set) => ({
  fluidConfig: {
    SPLAT_RADIUS: 0.15,
    SPLAT_FORCE: 1000,
    DENSITY_DISSIPATION: 5.0,
    VELOCITY_DISSIPATION: 0.8,
    PRESSURE: 0.8,
    CURL: 1,
    ABERRATION_MULT: 0.85,
    SWELL_MULT: 2.5,
    MAGNETIC_RADIUS: 0.05,
    SPLAT_COLOR: '#ffffff',
    COLOR_CYCLE: false,
    COLOR_CYCLE_SPEED: 1.0,
  },
  setFluidConfig: (config) => set((state) => ({
    fluidConfig: { ...state.fluidConfig, ...config }
  })),
});
