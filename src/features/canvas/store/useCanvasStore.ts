import { create } from 'zustand';
import { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect, applyNodeChanges, applyEdgeChanges, addEdge, ReactFlowInstance } from '@xyflow/react';

import { PhysicsSlice, createPhysicsSlice } from './slices/physicsSlice';
import { FluidSlice, createFluidSlice } from './slices/fluidSlice';
import { NodeActionSlice, createNodeActionSlice } from './slices/nodeActionSlice';

export interface CanvasState extends PhysicsSlice, FluidSlice, NodeActionSlice {
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
  timeCursor: number | null;
  setTimeCursor: (index: number | null) => void;
  setMockApiEnabled: (enabled: boolean) => void;
  setDebugDrawerOpen: (open: boolean) => void;
  isTimelineHovered: boolean;
  setTimelineHovered: (hovered: boolean) => void;
  isIntroAnimationFinished: boolean;
  isIntroReasoningFinished: boolean;
  setIntroAnimationFinished: (finished: boolean) => void;
  setIntroReasoningFinished: (finished: boolean) => void;

  // Prompt suggestions
  activeSuggestions: string[];
  setActiveSuggestions: (suggestions: string[]) => void;
  clearSuggestions: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get, store) => ({
  nodes: [],
  edges: [],
  rfInstance: null,
  trackedNodeId: null,
  timeCursor: null,
  isTimelineHovered: false,
  isMockApiEnabled: false,
  isDebugDrawerOpen: false,
  isIntroAnimationFinished: false,
  isIntroReasoningFinished: false,

  activeSuggestions: [],
  setActiveSuggestions: (suggestions) => set({ activeSuggestions: suggestions }),
  clearSuggestions: () => set({ activeSuggestions: [] }),

  setIntroAnimationFinished: (finished: boolean) => set({ isIntroAnimationFinished: finished }),
  setIntroReasoningFinished: (finished: boolean) => set({ isIntroReasoningFinished: finished }),

  onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) => set({ edges: applyEdgeChanges(changes, get().edges) }),
  onConnect: (connection) => set({ edges: addEdge(connection, get().edges) }),

  setNodes: (nodesOrUpdater) => set((state) => ({
    nodes: typeof nodesOrUpdater === 'function' ? nodesOrUpdater(state.nodes) : nodesOrUpdater
  })),
  setEdges: (edgesOrUpdater) => set((state) => ({
    edges: typeof edgesOrUpdater === 'function' ? edgesOrUpdater(state.edges) : edgesOrUpdater
  })),

  setRfInstance: (instance) => set({ rfInstance: instance }),
  setTrackedNodeId: (id) => set({ trackedNodeId: id }),
  setTimeCursor: (index) => set({ timeCursor: index }),
  setTimelineHovered: (hovered) => set({ isTimelineHovered: hovered }),
  setMockApiEnabled: (enabled) => set({ isMockApiEnabled: enabled }),
  setDebugDrawerOpen: (open) => set({ isDebugDrawerOpen: open }),

  ...createPhysicsSlice(set, get, store),
  ...createFluidSlice(set, get, store),
  ...createNodeActionSlice(set, get, store),
}));
