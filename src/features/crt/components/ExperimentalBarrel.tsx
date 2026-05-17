"use client";

import { useRef } from "react";
import { useWebGLBarrel } from "../hooks/useWebGLBarrel";

export function ExperimentalBarrel() {
  const glRef = useRef<HTMLCanvasElement>(null);
  
  useWebGLBarrel(glRef);

  return (
    <canvas
      ref={glRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, display: "none" }}
    />
  );
}
