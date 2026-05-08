"use client";

import { useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  PanOnScrollMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "welcome-node",
    position: { x: 250, y: 150 },
    data: { label: "Welcome to the Editorial Canvas" },
  },
];

const initialEdges: Edge[] = [];

export default function EditorialCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isMobile, setIsMobile] = useState(false);

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
    </div>
  );
}
