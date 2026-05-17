import { StateCreator } from 'zustand';
import type { Simulation, SimulationNodeDatum } from 'd3-force';
import type { CanvasState } from '../useCanvasStore';

export interface PhysicsSlice {
  physicsConfig: {
    velocityDecay: number;
    chargeStrength: number;
    linkDistance: number;
    linkStrength: number;
    linkIterations: number;
  };
  setPhysicsConfig: (config: Partial<PhysicsSlice['physicsConfig']>) => void;
  simulationRef: Simulation<SimulationNodeDatum, undefined> | null;
  setSimulationRef: (ref: Simulation<SimulationNodeDatum, undefined> | null) => void;
}

export const createPhysicsSlice: StateCreator<CanvasState, [], [], PhysicsSlice> = (set) => ({
  physicsConfig: {
    velocityDecay: 0.82,
    chargeStrength: -80,
    linkDistance: 400,
    linkStrength: 0.05,
    linkIterations: 1,
  },
  setPhysicsConfig: (config) => set((state) => ({
    physicsConfig: { ...state.physicsConfig, ...config }
  })),
  simulationRef: null,
  setSimulationRef: (ref) => set({ simulationRef: ref }),
});
