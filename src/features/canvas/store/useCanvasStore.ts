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
  // Physics config
  physicsConfig: {
    velocityDecay: number;
    chargeStrength: number;
    linkDistance: number;
    linkStrength: number;
    linkIterations: number;
  };
  setPhysicsConfig: (config: Partial<CanvasState['physicsConfig']>) => void;

  // Fluid config
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
  setFluidConfig: (config: Partial<CanvasState['fluidConfig']>) => void;

  // D3 Simulation reference for drag events
  simulationRef: any | null;
  setSimulationRef: (ref: any) => void;

  // Decoupled node creation
  activeGhostId: string | null;
  activeGhostText: string | null;
  activeStreamingTextId: string | null;
  activeStreamingText: string | null;
  lastPlacedNodeId: string | null;
  addPrompt: (text: string) => void;
  upsertActiveGhost: (text: string, isFinished?: boolean) => void;
  addHero: (data: any, id: string) => void;
  addProject: (data: any, id: string) => void;
  addText: (text: string, isFinished?: boolean) => void;
  truncateHistory: (cursorIndex: number) => void;
}

import { createPromptNode, createGhostNode, createHeroNode, createTextNode, createProjectNode, createEdge } from './nodeFactories';

export const INTRO_REVEAL_CLASSES = "transition-all duration-1000 ease-out";

export const useCanvasStore = create<CanvasState>((set, get) => ({
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
  setIntroAnimationFinished: (finished: boolean) => set({ isIntroAnimationFinished: finished }),
  setIntroReasoningFinished: (finished: boolean) => set({ isIntroReasoningFinished: finished }),

  physicsConfig: {
    velocityDecay: 0.4,
    chargeStrength: -30,
    linkDistance: 400,
    linkStrength: 1.0,
    linkIterations: 10,
  },
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
  simulationRef: null,

  activeGhostId: null,
  activeGhostText: null,
  activeStreamingTextId: null,
  activeStreamingText: null,
  lastPlacedNodeId: null,

  setPhysicsConfig: (config) => set((state) => ({
    physicsConfig: { ...state.physicsConfig, ...config }
  })),
  setFluidConfig: (config) => set((state) => ({
    fluidConfig: { ...state.fluidConfig, ...config }
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
  setTrackedNodeId: (id) => {
    set({ trackedNodeId: id });
  },

  setTimeCursor: (index) => {
    set({ timeCursor: index });
  },
  
  setTimelineHovered: (hovered) => set({ isTimelineHovered: hovered }),

  setMockApiEnabled: (enabled) => set({ isMockApiEnabled: enabled }),
  setDebugDrawerOpen: (open) => set({ isDebugDrawerOpen: open }),

  addPrompt: (text: string) => {
    const id = `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const nodes = get().nodes;
    const validNodes = nodes.filter(n => n.type !== 'intro');
    const sourceNode = validNodes.find(n => n.id === get().lastPlacedNodeId) || validNodes[validNodes.length - 1];
    const newNode = createPromptNode(id, text, sourceNode);

    set(state => {
      const newEdges = sourceNode ? [...state.edges, createEdge(sourceNode.id, id)] : state.edges;
      return {
        nodes: [...state.nodes, newNode],
        edges: newEdges,
        lastPlacedNodeId: id,
        trackedNodeId: id,
        activeStreamingTextId: null // Reset text streaming state
      };
    });

    const rf = get().rfInstance;
    if (rf) setTimeout(() => rf.fitView({ padding: 0.3, duration: 800, maxZoom: 1.2 }), 50);
    setTimeout(() => { if (get().trackedNodeId === id) set({ trackedNodeId: null }); }, 1500);
  },

  upsertActiveGhost: (text: string, isFinished = false) => {
    set(state => {
      let activeGhostId = state.activeGhostId;
      
      if (!activeGhostId && isFinished) {
        return state;
      }

      let nodes = [...state.nodes];
      const edges = [...state.edges];
      let lastPlacedNodeId = state.lastPlacedNodeId;
      let isNewGhost = false;

      if (!activeGhostId) {
        isNewGhost = true;
        activeGhostId = `ghost-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const validNodes = nodes.filter(n => n.type !== 'intro');
        const sourceNode = validNodes.find(n => n.id === lastPlacedNodeId) || validNodes[validNodes.length - 1];
        const newGhost = createGhostNode(activeGhostId, sourceNode);
        newGhost.data.text = text;
        nodes.push(newGhost);
        if (sourceNode) {
          edges.push(createEdge(sourceNode.id, activeGhostId));
        }
        lastPlacedNodeId = activeGhostId;
      }

      if (isFinished) {
        nodes = nodes.map(n =>
          n.id === activeGhostId
            ? { ...n, data: { ...n.data, text, isFinished } }
            : n
        );
      }

      return {
        nodes: isNewGhost || isFinished ? nodes : state.nodes,
        edges: isNewGhost ? edges : state.edges,
        activeGhostId: isFinished ? null : activeGhostId,
        activeGhostText: isFinished ? null : text,
        // Crucial fix: ensure lastPlacedNodeId properly updates to the ghost node
        // so subsequent nodes chain off it, instead of branching off the prompt!
        lastPlacedNodeId: isNewGhost ? activeGhostId : lastPlacedNodeId,
        trackedNodeId: isNewGhost ? activeGhostId : state.trackedNodeId 
      };
    });
  },

  addHero: (data: any, id: string) => {
    set(state => {
      const sourceNode = state.nodes.find(n => n.id === state.activeGhostId) || state.nodes.find(n => n.id === state.lastPlacedNodeId);
      console.log(`[DEBUG-FLOW] addHero | heroId=${id} | sourceNode=${sourceNode?.id}`);
      const newNode = createHeroNode(id, data, sourceNode);

      const newEdges = sourceNode ? [...state.edges, createEdge(sourceNode.id, id)] : state.edges;
      return { nodes: [...state.nodes, newNode], edges: newEdges, lastPlacedNodeId: id, trackedNodeId: id };
    });
  },

  addProject: (data: any, id: string) => {
    set(state => {
      const sourceNode = state.nodes.find(n => n.id === state.activeGhostId) || state.nodes.find(n => n.id === state.lastPlacedNodeId);
      console.log(`[DEBUG-FLOW] addProject | projectId=${id} | sourceNode=${sourceNode?.id}`);
      const newNode = createProjectNode(id, data, sourceNode);

      const newEdges = sourceNode ? [...state.edges, createEdge(sourceNode.id, id)] : state.edges;
      return { nodes: [...state.nodes, newNode], edges: newEdges, lastPlacedNodeId: id, trackedNodeId: id };
    });
  },

  addText: (text: string, isFinished: boolean = false) => {
    let targetId: string | null = null;

    set(state => {
      let newNodes = [...state.nodes];
      let newEdges = [...state.edges];
      let newlyCreated = false;

      if (state.activeStreamingTextId) {
        targetId = state.activeStreamingTextId;
        
        if (isFinished) {
          newNodes = newNodes.map(n =>
            n.id === targetId
              ? { ...n, data: { ...n.data, text } }
              : n
          );
        }

        return {
          nodes: isFinished ? newNodes : state.nodes,
          activeStreamingTextId: isFinished ? null : targetId,
          activeStreamingText: isFinished ? null : text,
          lastPlacedNodeId: isFinished ? targetId : state.lastPlacedNodeId,
          trackedNodeId: isFinished ? targetId : state.trackedNodeId
        };
      }

      targetId = `text-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const sourceNode = state.nodes.find(n => n.id === state.lastPlacedNodeId);
      const newNode = createTextNode(targetId, text, sourceNode);

      newEdges = sourceNode ? [...state.edges, createEdge(sourceNode.id, targetId)] : state.edges;
      newlyCreated = true;

      return { 
        nodes: [...newNodes, newNode], 
        edges: newEdges, 
        lastPlacedNodeId: isFinished ? targetId : state.lastPlacedNodeId,
        activeStreamingTextId: isFinished ? null : targetId,
        activeStreamingText: isFinished ? null : text,
        trackedNodeId: targetId 
      };
    });
  },

  truncateHistory: (cursorIndex: number) => {
    set((state) => {
      const newNodes = state.nodes.slice(0, cursorIndex + 1);
      const validNodeIds = new Set(newNodes.map(n => n.id));
      const newEdges = state.edges.filter(e => validNodeIds.has(e.source) && validNodeIds.has(e.target));
      const lastNode = newNodes[newNodes.length - 1];

      return {
        nodes: newNodes,
        edges: newEdges,
        timeCursor: null,
        lastPlacedNodeId: lastNode ? lastNode.id : null,
        activeGhostId: null,
        activeStreamingTextId: null
      };
    });
  }
}));
