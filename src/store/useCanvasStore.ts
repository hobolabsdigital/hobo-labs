import { create } from 'zustand';
import { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect, applyNodeChanges, applyEdgeChanges, addEdge, ReactFlowInstance } from '@xyflow/react';

export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  rfInstance: ReactFlowInstance | null;
  trackedNodeId: string | null;
  isMockApiEnabled: boolean;
  isDebugDrawerOpen: boolean;

  // ReactFlow callbacks
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  // Imperative setters
  setNodes: (nodes: Node[] | ((current: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((current: Edge[]) => Edge[])) => void;
  setRfInstance: (instance: ReactFlowInstance | null) => void;
  setTrackedNodeId: (id: string | null) => void;
  setMockApiEnabled: (enabled: boolean) => void;
  setDebugDrawerOpen: (open: boolean) => void;
  // Physics config
  physicsConfig: {
    velocityDecay: number;
    chargeStrength: number;
    linkDistance: number;
    linkStrength: number;
    linkIterations: number;
  };
  setPhysicsConfig: (config: Partial<CanvasState['physicsConfig']>) => void;
  
  // D3 Simulation reference for drag events
  simulationRef: any | null;
  setSimulationRef: (ref: any) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  rfInstance: null,
  trackedNodeId: null,
  isMockApiEnabled: false,
  isDebugDrawerOpen: false,

  physicsConfig: {
    velocityDecay: 0.4,
    chargeStrength: -30,
    linkDistance: 400,
    linkStrength: 1.0,
    linkIterations: 10,
  },
  simulationRef: null,

  setPhysicsConfig: (config) => set((state) => ({
    physicsConfig: { ...state.physicsConfig, ...config }
  })),
  setSimulationRef: (ref) => set({ simulationRef: ref }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    set({ edges: addEdge(connection, get().edges) });
  },

  setNodes: (nodesOrUpdater) => {
    set((state) => ({
      nodes: typeof nodesOrUpdater === 'function' ? nodesOrUpdater(state.nodes) : nodesOrUpdater
    }));
  },

  setEdges: (edgesOrUpdater) => {
    set((state) => ({
      edges: typeof edgesOrUpdater === 'function' ? edgesOrUpdater(state.edges) : edgesOrUpdater
    }));
  },

  setRfInstance: (instance) => set({ rfInstance: instance }),
  setTrackedNodeId: (id) => set({ trackedNodeId: id }),
  setMockApiEnabled: (enabled) => set({ isMockApiEnabled: enabled }),
  setDebugDrawerOpen: (open) => set({ isDebugDrawerOpen: open })
}));
