"use client";

import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";

export function HeroNode({ data }: { data: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex flex-col p-4 shadow-sm border border-border"
      style={{ 
        borderRadius: "3.6rem", 
        width: "400px", 
        height: "500px",
        backgroundColor: data.color || "var(--color-accent-blue)" 
      }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex-1 overflow-hidden" style={{ borderRadius: "2rem" }}>
        {data.image ? (
          <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-white/30 flex items-center justify-center">
            <span className="text-black/50 font-mono text-sm">IMAGE MASK</span>
          </div>
        )}
      </div>
      <div className="mt-4 px-4 pb-2">
        <h2 className="text-3xl font-sans font-medium text-black tracking-tight">{data.title || "Project Title"}</h2>
        <p className="text-black/80 font-sans mt-2">{data.description || "Description"}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </motion.div>
  );
}
