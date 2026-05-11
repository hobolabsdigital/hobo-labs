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
  activeStreamingTextId: string | null;
  lastPlacedNodeId: string | null;
  addPrompt: (text: string) => void;
  upsertActiveGhost: (text: string, isFinished?: boolean) => void;
  addHero: (data: any, id: string) => void;
  addText: (text: string, isFinished?: boolean) => void;
  truncateHistory: (cursorIndex: number) => void;
}

import { createPromptNode, createGhostNode, createHeroNode, createTextNode, createEdge } from './nodeFactories';

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [
    {
      id: 'hero-1',
      type: 'hero',
      position: { x: 50, y: 50 },
      data: {
        headline: 'THE\nCREATIVE\nENGINE',
        subline: 'I build experimental interfaces and AI-driven experiences.',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'
      },
    },
    {
      id: 'text-1',
      type: 'text',
      position: { x: 800, y: 550 },
      data: {
        text: 'Exploring the intersection of brutalist design and generative AI. This canvas is alive.',
        label: 'CONTEXT'
      }
    }
  ],
  edges: [{ id: 'e-hero-1-text-1', source: 'hero-1', target: 'text-1' }],
  rfInstance: null,
  trackedNodeId: null,
  timeCursor: null,
  isTimelineHovered: false,
  isMockApiEnabled: false,
  isDebugDrawerOpen: false,

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
  activeStreamingTextId: null,
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
    const sourceNode = nodes.find(n => n.id === get().lastPlacedNodeId) || nodes[nodes.length - 1];
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
    let isNewGhost = false;
    
    set(state => {
      let activeGhostId = state.activeGhostId;
      
      if (!activeGhostId && isFinished) {
        return state;
      }

      let nodes = [...state.nodes];
      let edges = [...state.edges];
      let lastPlacedNodeId = state.lastPlacedNodeId;

      if (!activeGhostId) {
        isNewGhost = true;
        activeGhostId = `ghost-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const sourceNode = nodes.find(n => n.id === lastPlacedNodeId) || nodes[nodes.length - 1];
        const newGhost = createGhostNode(activeGhostId, sourceNode);

        nodes.push(newGhost);
        if (sourceNode) {
          edges.push(createEdge(sourceNode.id, activeGhostId));
        }
        lastPlacedNodeId = activeGhostId;
      }

      nodes = nodes.map(n =>
        n.id === activeGhostId
          ? { ...n, data: { ...n.data, text, isFinished } }
          : n
      );

      return {
        nodes,
        edges,
        activeGhostId: isFinished ? null : activeGhostId,
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
      console.log(`[DEBUG-FLOW] addHero | heroId=${id} | sourceNode=${sourceNode?.id} | activeGhostId=${state.activeGhostId}`);
      const newNode = createHeroNode(id, data, sourceNode);

      const newEdges = sourceNode ? [...state.edges, createEdge(sourceNode.id, id)] : state.edges;
      return { nodes: [...state.nodes, newNode], edges: newEdges, lastPlacedNodeId: id, trackedNodeId: id };
    });
  },

  addText: (text: string, isFinished: boolean = false) => {
    let newlyCreated = false;
    let targetId: string | null = null;

    set(state => {
      let newNodes = [...state.nodes];
      let newEdges = [...state.edges];
      let lastPlacedId = state.lastPlacedNodeId;

      // 1. If we are already streaming into a text node, just update it
      if (state.activeStreamingTextId) {
        newNodes = newNodes.map(n =>
          n.id === state.activeStreamingTextId
            ? { ...n, data: { ...n.data, text } }
            : n
        );
        targetId = state.activeStreamingTextId;

        return {
          nodes: newNodes,
          edges: newEdges,
          activeStreamingTextId: state.activeStreamingTextId, // Keep it locked until next prompt!
          lastPlacedNodeId: isFinished ? targetId : state.lastPlacedNodeId,
          trackedNodeId: targetId
        };
      }

      // 2. Fallback if no active streaming text exists
      targetId = `text-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const sourceNode = state.nodes.find(n => n.id === state.lastPlacedNodeId);
      const newNode = createTextNode(targetId, text, sourceNode);

      newEdges = sourceNode ? [...state.edges, createEdge(sourceNode.id, targetId)] : state.edges;
      newlyCreated = true;

      return { 
        nodes: [...newNodes, newNode], 
        edges: newEdges, 
        lastPlacedNodeId: isFinished ? targetId : state.lastPlacedNodeId,
        activeStreamingTextId: targetId, // Lock the streaming text ID
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
