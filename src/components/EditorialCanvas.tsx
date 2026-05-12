"use client";

import React, { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Node,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Nodes
import { HeroNode } from './nodes/HeroNode';
import { TextNode } from './nodes/TextNode';
import { PromptNode } from './nodes/PromptNode';
import { GhostNode } from './nodes/GhostNode';
import { ChatInput } from './ChatInput';
import { DebugPanel } from './DebugPanel';
import { TimelineScrubber } from './TimelineScrubber';
import { FluidBackground } from './FluidBackground';
import { InteractiveGrid } from './InteractiveGrid';
import { ThemeToggle } from './ThemeToggle';
import { Swarm } from './Swarm';
import { useTheme } from '@/components/theme-provider';

// Hooks and Store
import { useCanvasStore } from '../store/useCanvasStore';
import { useBeeStore } from '../store/useBeeStore';
import { useEditorialPhysics } from '../hooks/useEditorialPhysics';
import { useEdgeAnimations } from '../hooks/useEdgeAnimations';
import { SwarmTerminal } from './SwarmTerminal';

const nodeTypes = { hero: HeroNode, text: TextNode, prompt: PromptNode, ghost: GhostNode };

// We keep the node definitions here for easy reference, but initial state 
// injection happens entirely in useCanvasStore.ts now.

export default function EditorialCanvas() {
  const { theme } = useTheme();
  const nodes = useCanvasStore(state => state.nodes);
  const edges = useCanvasStore(state => state.edges);
  const onNodesChange = useCanvasStore(state => state.onNodesChange);
  const onEdgesChange = useCanvasStore(state => state.onEdgesChange);
  const onConnect = useCanvasStore(state => state.onConnect);
  const setRfInstance = useCanvasStore(state => state.setRfInstance);
  const setTrackedNodeId = useCanvasStore(state => state.setTrackedNodeId);
  const trackedNodeId = useCanvasStore(state => state.trackedNodeId);
  const timeCursor = useCanvasStore(state => state.timeCursor);
  const rfInstance = useCanvasStore(state => state.rfInstance);

  const activeMischief = useBeeStore(state => state.activeMischief);

  // Filter nodes and edges based on the timeline scrubber
  const visibleNodes = React.useMemo(() => {
    return timeCursor === null ? nodes : nodes.slice(0, timeCursor + 1);
  }, [nodes, timeCursor]);

  const visibleEdges = React.useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return edges.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
  }, [edges, visibleNodes]);

  // Generic camera tracking effect
  useEffect(() => {
    if (trackedNodeId && rfInstance) {
      // Small delay to ensure node bounds are calculated by ReactFlow
      const timeoutId = setTimeout(() => {
        rfInstance.fitView({ padding: 0.3, duration: 800, maxZoom: 1.2 });
      }, 50);

      // Reset the tracking lock after the animation completes so D3 doesn't permanently lock the camera
      const resetId = setTimeout(() => {
        setTrackedNodeId(null);
      }, 1500);

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(resetId);
      };
    }
  }, [trackedNodeId, rfInstance, setTrackedNodeId]);

  // Fit view when traveling through time
  useEffect(() => {
    if (rfInstance && timeCursor !== undefined) {
      const timeoutId = setTimeout(() => {
        rfInstance.fitView({ padding: 0.3, duration: 800, maxZoom: 1.2 });
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [timeCursor, rfInstance]);

  // Activate custom hooks
  useEditorialPhysics();
  useEdgeAnimations();

  const onNodeDragStart = useCallback((event: React.MouseEvent, node: Node) => {
    const simulation = useCanvasStore.getState().simulationRef;
    if (!simulation) return;

    // Find the internal node
    const simNode = simulation.nodes().find((n: any) => n.id === node.id);
    if (simNode) {
      simNode.fx = node.position.x;
      simNode.fy = node.position.y;

      // Gentle heat to make the mesh elastic without blowing it up
      simulation.alphaTarget(0.05).restart();
    }
  }, []);

  const onNodeDrag = useCallback((event: React.MouseEvent, node: Node) => {
    const simulation = useCanvasStore.getState().simulationRef;
    if (!simulation) return;

    const simNode = simulation.nodes().find((n: any) => n.id === node.id);
    if (simNode) {
      simNode.fx = node.position.x;
      simNode.fy = node.position.y;
    }
  }, []);

  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    const simulation = useCanvasStore.getState().simulationRef;
    if (!simulation) return;

    const simNode = simulation.nodes().find((n: any) => n.id === node.id);
    if (simNode) {
      if (node.id !== 'hero-1') {
        simNode.fx = null;
        simNode.fy = null;
      }
      // Let it cool down and snap back to equilibrium
      simulation.alphaTarget(0);
    }
  }, []);

  return (
    <div className={`w-full h-screen bg-[var(--background)] relative ${activeMischief === 'invert' ? 'filter invert duration-500' : 'duration-500'}`}>
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        onInit={setRfInstance}
        proOptions={{ hideAttribution: true }}
        colorMode={theme === 'dark' ? 'dark' : 'light'}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
        className="bg-grid"
        minZoom={0.5}
        maxZoom={2}
      >
        <InteractiveGrid gap={24} size={2} color="var(--grid-color)" repelRadius={150} repelStrength={15} />
        <Controls className="fill-foreground stroke-foreground" />
      </ReactFlow>

      <Swarm count={3} type="worker" />
      <Swarm count={3} type="soldier" />
      <SwarmTerminal />
      <DebugPanel />
      <TimelineScrubber />
      <FluidBackground />
      <ThemeToggle />

      <ChatInput />
    </div>
  );
}

