"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, animate, useAnimationFrame } from "framer-motion";
import { useCanvasStore } from "@/store/useCanvasStore";

export function TimelineScrubber() {
  const nodes = useCanvasStore((state) => state.nodes);
  const timeCursor = useCanvasStore((state) => state.timeCursor);
  const setTimeCursor = useCanvasStore((state) => state.setTimeCursor);
  const setTimelineHovered = useCanvasStore((state) => state.setTimelineHovered);
  const isDebugDrawerOpen = useCanvasStore((state) => state.isDebugDrawerOpen);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredThumb, setIsHoveredThumb] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // If there are less than 2 nodes, history scrubbing doesn't make much sense.
  if (nodes.length <= 1) return null;

  const maxIndex = nodes.length - 1;
  const currentValue = timeCursor !== null ? timeCursor : maxIndex;

  const [containerHeight, setContainerHeight] = useState(0);

  // Measure container height on mount and resize
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.getBoundingClientRect().height);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const y = useMotionValue(0);
  const springY = useSpring(y, { stiffness: 400, damping: 30 });

  // Physics mapping
  const CH = containerHeight || 800;
  const paddingY = 32;
  const maxY = CH - paddingY; // Bottom-most drag position (oldest)
  
  // As nodes are added, the "present" bulb creeps up the track.
  // We'll say the track visually "fills" over 20 nodes.
  const VISUAL_MAX_NODES = 20;
  const fillRatio = Math.min(nodes.length / VISUAL_MAX_NODES, 1);
  // The "present" position (where the bulb sits when at the newest node)
  const presentY = maxY - (fillRatio * (maxY - paddingY));
  
  // Drag bounds: can only scrub between presentY (top) and maxY (bottom)
  const dragConstraints = { top: presentY, bottom: maxY };

  // Physics values for interactions
  const targetR = isDragging ? 6 : (isHoveredThumb ? 14 : 10);
  const targetL = isDragging ? 120 : (isHoveredThumb ? 40 : 60);

  const bulbRadius = useSpring(10, { stiffness: 500, damping: 15 });
  const taperLength = useSpring(60, { stiffness: 500, damping: 15 });

  useEffect(() => {
    bulbRadius.set(targetR);
    taperLength.set(targetL);
  }, [targetR, targetL, bulbRadius, taperLength]);

  const path = useMotionValue("");

  useAnimationFrame(() => {
    const yVal = springY.get();
    const r = bulbRadius.get();
    const L = taperLength.get();
    const cx = 32;
    const w = 2; // track half-width
    
    const cy = Math.max(paddingY, Math.min(yVal, CH - paddingY));
    
    path.set(`
      M ${cx - w} 0 
      L ${cx - w} ${cy - L}
      C ${cx - w} ${cy - L * 0.4}, ${cx - r} ${cy - L * 0.2}, ${cx - r} ${cy}
      C ${cx - r} ${cy + L * 0.2}, ${cx - w} ${cy + L * 0.4}, ${cx - w} ${cy + L}
      L ${cx - w} ${CH}
      L ${cx + w} ${CH}
      L ${cx + w} ${cy + L}
      C ${cx + w} ${cy + L * 0.4}, ${cx + r} ${cy + L * 0.2}, ${cx + r} ${cy}
      C ${cx + r} ${cy - L * 0.2}, ${cx + w} ${cy - L * 0.4}, ${cx + w} ${cy - L}
      L ${cx + w} 0
      Z
    `);
  });

  const handleDragStart = () => {
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  const handleDrag = () => {
    if (!containerRef.current || containerHeight === 0) return;
    
    const currentY = y.get();
    
    // Calculate ratio from 0 (present) to 1 (oldest)
    const dragRange = maxY - presentY;
    let ratio = dragRange === 0 ? 0 : (currentY - presentY) / dragRange;
    ratio = Math.max(0, Math.min(ratio, 1));
    
    const targetIndex = Math.round((1 - ratio) * maxIndex);
    
    if (targetIndex === maxIndex) {
      setTimeCursor(null);
    } else {
      setTimeCursor(targetIndex);
    }
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // Sync external timeCursor resets
  useEffect(() => {
    if (!isDraggingRef.current && containerHeight > 0) {
      if (timeCursor === null) {
        // Snap to present (top-most position available)
        animate(y, presentY, { type: "spring", stiffness: 400, damping: 30 });
      } else {
        const ratio = 1 - (timeCursor / maxIndex);
        const targetY = presentY + ratio * (maxY - presentY);
        animate(y, targetY, { type: "spring", stiffness: 400, damping: 30 });
      }
    }
  }, [timeCursor, maxIndex, y, containerHeight, presentY, maxY]);

  return (
    <div 
      className={`fixed top-[10vh] h-[80vh] w-16 z-[60] pointer-events-auto mix-blend-difference transition-all duration-300 ease-out ${
        isDebugDrawerOpen ? 'right-[340px]' : 'right-8'
      }`}
      onPointerEnter={() => { setIsHovered(true); setTimelineHovered(true); }}
      onPointerLeave={() => { setIsHovered(false); setTimelineHovered(false); }}
      ref={containerRef}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <motion.path 
          d={path} 
          className="fill-white drop-shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
        />
      </svg>
      
      {/* Invisible drag handle positioned exactly over the "fat bit" */}
      <motion.div
        className="absolute w-full cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
        style={{ height: 48, top: -24, y }}
        onPointerEnter={() => setIsHoveredThumb(true)}
        onPointerLeave={() => setIsHoveredThumb(false)}
        drag="y"
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      />

      {/* Floating Monospace Indicator */}
      {isHovered && timeCursor !== null && (
        <motion.div 
          className="absolute right-full mr-4 text-[10px] uppercase font-mono bg-foreground text-background px-3 py-2 shadow-2xl pointer-events-none tracking-widest whitespace-nowrap"
          style={{ y: springY, top: -12 }}
        >
          HISTORY: -{(maxIndex - currentValue)} TURNS
        </motion.div>
      )}
    </div>
  );
}
