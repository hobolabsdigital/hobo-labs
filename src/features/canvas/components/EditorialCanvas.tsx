"use client";

import React, { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Node,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { HeroNode } from '@/features/canvas/components/nodes/HeroNode';
import { TextNode } from '@/features/canvas/components/nodes/TextNode';
import { PromptNode } from '@/features/canvas/components/nodes/PromptNode';
import { GhostNode } from '@/features/canvas/components/nodes/GhostNode';
import { ProjectNode } from '@/features/canvas/components/nodes/ProjectNode';
import { IntroNode } from '@/features/canvas/components/nodes/IntroNode';
import { useTheme } from '@/core/theme/theme-provider';

// Hooks and Store
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { useBeeStore } from '@/features/swarm/store/useBeeStore';
import { useEditorialPhysics } from '@/features/canvas/hooks/useEditorialPhysics';
import { useEdgeAnimations } from '@/features/canvas/hooks/useEdgeAnimations';

const nodeTypes = { hero: HeroNode, text: TextNode, prompt: PromptNode, ghost: GhostNode, project: ProjectNode, intro: IntroNode };

// We keep the node definitions here for easy reference, but initial state 
// injection happens entirely in useCanvasStore.ts now.

export default function EditorialCanvas({ children }: { children?: React.ReactNode }) {
  const { theme } = useTheme();
  const nodes = useCanvasStore(state => state.nodes);
  const edges = useCanvasStore(state => state.edges);
  const onNodesChange = useCanvasStore(state => state.onNodesChange);
  const onEdgesChange = useCanvasStore(state => state.onEdgesChange);
  const onConnect = useCanvasStore(state => state.onConnect);
  const setRfInstance = useCanvasStore(state => state.setRfInstance);
  const setTrackedNodeId = useCanvasStore(state => state.setTrackedNodeId);
  const trackedNodeId = useCanvasStore(state => state.trackedNodeId);
  const rfInstance = useCanvasStore(state => state.rfInstance);
  const isIntroAnimationFinished = useCanvasStore(state => state.isIntroAnimationFinished);
  const isIntroReasoningFinished = useCanvasStore(state => state.isIntroReasoningFinished);
  const timeCursor = useCanvasStore(state => state.timeCursor);

  const isIntroActive = !(isIntroAnimationFinished && isIntroReasoningFinished);

  const activeMischief = useBeeStore(state => state.activeMischief);

  // Filter nodes and edges based on the timeline scrubber and intro state
  const visibleNodes = React.useMemo(() => {
    return nodes.map((node, index) => {
      const isPastCursor = timeCursor !== null && index > timeCursor;
      const isHidden = isIntroActive || isPastCursor;
      
      return {
        ...node,
        style: {
          ...node.style,
          opacity: isHidden ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: (isHidden ? 'none' : 'auto') as React.CSSProperties['pointerEvents']
        }
      };
    });
  }, [nodes, timeCursor, isIntroActive]);

  const visibleEdges = React.useMemo(() => {
    return edges.map(edge => {
      const sourceNodeIndex = nodes.findIndex(n => n.id === edge.source);
      const targetNodeIndex = nodes.findIndex(n => n.id === edge.target);
      const isPastCursor = timeCursor !== null && (sourceNodeIndex > timeCursor || targetNodeIndex > timeCursor);
      const isHidden = isIntroActive || isPastCursor;
      
      return {
        ...edge,
        style: {
          ...edge.style,
          opacity: isHidden ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
        }
      };
    });
  }, [edges, nodes, timeCursor, isIntroActive]);

  // Camera focus on Intro Node
  useEffect(() => {
    if (rfInstance) {
      if (isIntroActive) {
        // Snap immediately to intro node without animation so user sees it right away
        rfInstance.setCenter(0, -2000, { zoom: 1, duration: 0 });
      } else {
        // Smoothly pan down to fit all nodes
        setTimeout(() => {
          rfInstance.fitView({ padding: 0.3, duration: 2000, maxZoom: 1.2 });
        }, 50);
      }
    }
  }, [isIntroActive, rfInstance]);

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
        {children}
        <Controls className="fill-foreground stroke-foreground" />
      </ReactFlow>
    </div>
  );
}

