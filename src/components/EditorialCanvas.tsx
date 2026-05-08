"use client";

import { useEffect, useState, useMemo } from "react";
import { useChat } from "ai/react";
import {
  ReactFlow,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  PanOnScrollMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { HeroNode } from "./nodes/HeroNode";
import { TextNode } from "./nodes/TextNode";
import { ChatInput } from "./ChatInput";

const initialNodes: Node[] = [
  {
    id: "welcome-node",
    type: "text",
    position: { x: 250, y: 150 },
    data: { label: "Welcome to the Editorial Canvas." },
  },
  {
    id: "hero-demo",
    type: "hero",
    position: { x: 800, y: 100 },
    data: { title: "MonstoryX", description: "A generative AI Tamagotchi", color: "var(--color-accent-lime)" },
  }
];

const initialEdges: Edge[] = [
  { id: "e1", source: "welcome-node", target: "hero-demo", animated: true, style: { stroke: '#000', strokeWidth: 2 } }
];

export default function EditorialCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize Vercel AI SDK chat
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  });

  const nodeTypes = useMemo(() => ({ hero: HeroNode, text: TextNode }), []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full h-screen grid-bg relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        panOnDrag={!isMobile}
        zoomOnScroll={!isMobile}
        zoomOnDoubleClick={!isMobile}
        panOnScroll={!isMobile}
        panOnScrollMode={PanOnScrollMode.Free}
        fitView
        className="editorial-flow"
      >
        <Controls showInteractive={false} />
      </ReactFlow>
      
      <ChatInput 
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
