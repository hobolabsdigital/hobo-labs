import { StateCreator } from 'zustand';
import type { CanvasState } from '../useCanvasStore';
import { createPromptNode, createGhostNode, createHeroNode, createTextNode, createProjectNode, createEdge } from '../nodeFactories';
import { Node } from '@xyflow/react';

export interface NodeActionSlice {
  activeGhostId: string | null;
  activeGhostText: string | null;
  activeStreamingTextId: string | null;
  activeStreamingText: string | null;
  lastPlacedNodeId: string | null;
  nodeCreationCounter: number;
  
  addPrompt: (text: string) => void;
  createGhost: (text?: string) => void;
  updateGhostText: (text: string) => void;
  finishGhost: (text: string) => void;
  addHero: (data: any, id: string) => void;
  addProject: (data: any, id: string) => void;
  addText: (text: string, isFinished?: boolean) => void;
  truncateHistory: (cursorIndex: number) => void;
  updateNodeData: (id: string, partialData: Record<string, any>) => void;
}

/**
 * Shared helper for addHero/addProject — encapsulates the repeated pattern of:
 * 1. Finding the source node (ghost or last placed)
 * 2. Creating the new node via factory
 * 3. Stamping creationIndex
 * 4. Creating the edge
 * 5. Updating tracking state
 */
function addNodeToCanvas(
  set: (fn: (state: CanvasState) => Partial<CanvasState>) => void,
  get: () => CanvasState,
  factory: (id: string, data: any, source?: Node) => Node,
  id: string,
  data: any
) {
  set(state => {
    const sourceNode = state.nodes.find(n => n.id === state.activeGhostId)
      || state.nodes.find(n => n.id === state.lastPlacedNodeId);
    const newNode = factory(id, data, sourceNode);
    const ci = state.nodeCreationCounter;
    newNode.data = { ...newNode.data, creationIndex: ci };

    const newEdges = sourceNode
      ? [...state.edges, createEdge(sourceNode.id, id)]
      : state.edges;

    return {
      nodes: [...state.nodes, newNode],
      edges: newEdges,
      lastPlacedNodeId: id,
      trackedNodeId: id,
      nodeCreationCounter: ci + 1,
    };
  });
}

export const createNodeActionSlice: StateCreator<CanvasState, [], [], NodeActionSlice> = (set, get) => ({
  activeGhostId: null,
  activeGhostText: null,
  activeStreamingTextId: null,
  activeStreamingText: null,
  lastPlacedNodeId: null,
  nodeCreationCounter: 0,

  addPrompt: (text: string) => {
    const id = `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const nodes = get().nodes;
    const validNodes = nodes.filter(n => n.type !== 'intro');
    const sourceNode = validNodes.find(n => n.id === get().lastPlacedNodeId) || validNodes[validNodes.length - 1];
    const newNode = createPromptNode(id, text, sourceNode);

    set(state => {
      const ci = state.nodeCreationCounter;
      newNode.data = { ...newNode.data, creationIndex: ci };
      const newEdges = sourceNode ? [...state.edges, createEdge(sourceNode.id, id)] : state.edges;
      return {
        nodes: [...state.nodes, newNode],
        edges: newEdges,
        lastPlacedNodeId: id,
        trackedNodeId: id,
        activeStreamingTextId: null,
        nodeCreationCounter: ci + 1,
      };
    });

    setTimeout(() => { if (get().trackedNodeId === id) set({ trackedNodeId: null }); }, 1500);
  },

  createGhost: (text: string = 'Organizing thoughts...') => {
    set(state => {
      if (state.activeGhostId) return state;

      const ghostId = `ghost-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const validNodes = state.nodes.filter(n => n.type !== 'intro');
      const sourceNode = validNodes.find(n => n.id === state.lastPlacedNodeId) || validNodes[validNodes.length - 1];
      const newGhost = createGhostNode(ghostId, sourceNode);
      const ci = state.nodeCreationCounter;
      newGhost.data = { ...newGhost.data, text, creationIndex: ci };

      const newEdges = sourceNode
        ? [...state.edges, createEdge(sourceNode.id, ghostId)]
        : state.edges;

      return {
        nodes: [...state.nodes, newGhost],
        edges: newEdges,
        activeGhostId: ghostId,
        activeGhostText: text,
        lastPlacedNodeId: ghostId,
        trackedNodeId: ghostId,
        nodeCreationCounter: ci + 1,
      };
    });
  },

  updateGhostText: (text: string) => {
    set(state => {
      if (!state.activeGhostId) return state;
      const ghostId = state.activeGhostId;
      return {
        activeGhostText: text,
        nodes: state.nodes.map(n =>
          n.id === ghostId ? { ...n, data: { ...n.data, text } } : n
        ),
      };
    });
  },

  finishGhost: (text: string) => {
    set(state => {
      if (!state.activeGhostId) return state;
      const ghostId = state.activeGhostId;
      return {
        nodes: state.nodes.map(n =>
          n.id === ghostId ? { ...n, data: { ...n.data, text, isFinished: true } } : n
        ),
        activeGhostId: null,
        activeGhostText: null,
      };
    });
  },

  /** Shared helper — finds source, stamps creationIndex, creates edge, tracks camera */
  addHero: (data: any, id: string) => {
    addNodeToCanvas(set, get, createHeroNode, id, data);
  },

  addProject: (data: any, id: string) => {
    addNodeToCanvas(set, get, createProjectNode, id, data);
  },

  addText: (text: string, isFinished: boolean = false) => {
    let targetId: string | null = null;

    set(state => {
      let newNodes = [...state.nodes];
      let newEdges = [...state.edges];

      if (state.activeStreamingTextId) {
        targetId = state.activeStreamingTextId;
        if (isFinished) {
          newNodes = newNodes.map(n => n.id === targetId ? { ...n, data: { ...n.data, text } } : n);
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
      const ci = state.nodeCreationCounter;
      const newNode = createTextNode(targetId, text, sourceNode);
      newNode.data = { ...newNode.data, creationIndex: ci };

      newEdges = sourceNode ? [...state.edges, createEdge(sourceNode.id, targetId)] : state.edges;

      return {
        nodes: [...newNodes, newNode],
        edges: newEdges,
        lastPlacedNodeId: isFinished ? targetId : state.lastPlacedNodeId,
        activeStreamingTextId: isFinished ? null : targetId,
        activeStreamingText: isFinished ? null : text,
        trackedNodeId: targetId,
        nodeCreationCounter: ci + 1,
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
  },

  updateNodeData: (id: string, partialData: Record<string, any>) => {
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, ...partialData } } : n
      )
    }));
  },
});
