import { StateCreator } from 'zustand';
import type { Simulation, SimulationLinkDatum } from 'd3-force';
import type { CanvasState } from '../useCanvasStore';
import type { AABBNode } from '../../hooks/forceAABB';

export interface PhysicsSlice {
  physicsConfig: {
    velocityDecay: number;
    chargeStrength: number;
    linkDistance: number;
    linkStrength: number;
    linkIterations: number;
  };
  setPhysicsConfig: (config: Partial<PhysicsSlice['physicsConfig']>) => void;
  simulationRef: Simulation<AABBNode, SimulationLinkDatum<AABBNode>> | null;
  setSimulationRef: (ref: Simulation<AABBNode, SimulationLinkDatum<AABBNode>> | null) => void;
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
