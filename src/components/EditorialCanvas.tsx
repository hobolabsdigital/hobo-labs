"use client";

import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Nodes
import { HeroNode } from './nodes/HeroNode';
import { TextNode } from './nodes/TextNode';
import { PromptNode } from './nodes/PromptNode';
import { GhostNode } from './nodes/GhostNode';
import { ChatInput } from './ChatInput';
import { DebugPanel } from './DebugPanel';

// Hooks and Store
import { useCanvasStore } from '../store/useCanvasStore';
import { useEditorialPhysics } from '../hooks/useEditorialPhysics';
import { useEditorialChat } from '../hooks/useEditorialChat';
import { useEdgeAnimations } from '../hooks/useEdgeAnimations';

const nodeTypes = { hero: HeroNode, text: TextNode, prompt: PromptNode, ghost: GhostNode };

const initialNodes: Node[] = [
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
];

export default function EditorialCanvas() {
  const nodes = useCanvasStore(state => state.nodes);
  const edges = useCanvasStore(state => state.edges);
  const onNodesChange = useCanvasStore(state => state.onNodesChange);
  const onEdgesChange = useCanvasStore(state => state.onEdgesChange);
  const onConnect = useCanvasStore(state => state.onConnect);
  const setRfInstance = useCanvasStore(state => state.setRfInstance);
  const setNodes = useCanvasStore(state => state.setNodes);
  const setEdges = useCanvasStore(state => state.setEdges);

  // Initialize store if empty
  useEffect(() => {
    if (useCanvasStore.getState().nodes.length === 0) {
      setNodes(initialNodes);
      setEdges([{ id: 'e-hero-1-text-1', source: 'hero-1', target: 'text-1' }]);
    }
  }, [setNodes, setEdges]);

  // Activate custom hooks
  useEditorialPhysics();
  useEdgeAnimations();
  const { input, setInput, handleSend, status } = useEditorialChat();

  const onNodeDragStart = useCallback((event: React.MouseEvent, node: Node) => {
    const simulation = useCanvasStore.getState().simulationRef;
    if (!simulation) return;
    
    // Find the internal node
    const simNode = simulation.nodes().find((n: any) => n.id === node.id);
    if (simNode) {
      simNode.fx = node.position.x;
      simNode.fy = node.position.y;
      
      // Gentle heat to make the mesh elastic
      simulation.alphaTarget(0.3).restart();
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
    <div className="w-full h-screen bg-[var(--background)] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        onInit={setRfInstance}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
        className="bg-grid"
        minZoom={0.5}
        maxZoom={2}
      >
        <Background gap={24} size={2} color="var(--grid-color)" />
        <Controls className="fill-foreground stroke-foreground" />
      </ReactFlow>

      <DebugPanel />

      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        isLoading={status === 'submitted' || status === 'streaming'}
      />
    </div>
  );
}
