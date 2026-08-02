"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, animate, useAnimationFrame } from "framer-motion";
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { INTRO_REVEAL_CLASSES } from '@/features/canvas/constants';

export function TimelineScrubber() {
  const nodesLength = useCanvasStore((state) => state.nodes.length);
  const timeCursor = useCanvasStore((state) => state.timeCursor);
  const setTimeCursor = useCanvasStore((state) => state.setTimeCursor);
  const setTimelineHovered = useCanvasStore((state) => state.setTimelineHovered);
  const isDebugDrawerOpen = useCanvasStore((state) => state.isDebugDrawerOpen);
  const epochs = useCanvasStore((state) => state.epochs);
  const viewingEpochId = useCanvasStore((state) => state.viewingEpochId);
  const setViewingEpoch = useCanvasStore((state) => state.setViewingEpoch);

  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredThumb, setIsHoveredThumb] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredChapterId, setHoveredChapterId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);


  const maxIndex = nodesLength - 1;
  const currentValue = timeCursor !== null ? timeCursor : maxIndex;

  const [containerHeight, setContainerHeight] = useState(0);

  // Measure container height robustly using window.innerHeight to match h-[80vh]
  useEffect(() => {
    const measure = () => {
      setContainerHeight(window.innerHeight - 112);
    };
    
    // Initial measure
    measure();
    
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const y = useMotionValue(0);
  const springY = useSpring(y, { stiffness: 400, damping: 30 });

  // Physics mapping
  const CH = containerHeight || 800;
  const paddingY = 32;
  // Chapter markers occupy the foot of the track (24px marker + 4px gap each,
  // plus the live marker), so the drag range has to stop short of them.
  const chaptersHeight = epochs.length > 0 ? (epochs.length + 1) * 28 + 16 : 0;
  const maxY = Math.max(paddingY, CH - paddingY - chaptersHeight); // Bottom-most drag position (oldest)

  // The "present" position is always at the top of the track
  const presentY = paddingY;
  
  // Drag bounds: can only scrub between presentY (top) and maxY (bottom)
  const dragConstraints = React.useMemo(() => ({ 
    top: presentY, 
    bottom: maxY 
  }), [presentY, maxY]);

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
    if (!containerRef.current) return;
    
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
      if (timeCursor === null || maxIndex <= 0) {
        // Snap to present (top-most position available)
        animate(y, presentY, { type: "spring", stiffness: 400, damping: 30 });
      } else {
        const ratio = 1 - (timeCursor / maxIndex);
        const targetY = presentY + ratio * (maxY - presentY);
        animate(y, targetY, { type: "spring", stiffness: 400, damping: 30 });
      }
    }
  }, [timeCursor, maxIndex, y, containerHeight, presentY, maxY]);

  const isIntroAnimationFinished = useCanvasStore((state) => state.isIntroAnimationFinished);

  const isViewingEpoch = viewingEpochId !== null;
  // If there are less than 2 nodes, history scrubbing doesn't make much sense —
  // but archived chapters still need somewhere to live.
  const hasLiveTimeline = nodesLength > 1;
  if (!hasLiveTimeline && epochs.length === 0) return null;

  return (
    <div 
      className={`fixed top-20 h-[calc(100dvh-7rem)] w-16 z-[60] ${INTRO_REVEAL_CLASSES} ${
        !isIntroAnimationFinished ? 'translate-x-[150%] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100 pointer-events-auto'
      } ${
        isDebugDrawerOpen ? 'right-[340px]' : 'right-8'
      }`}
      onPointerEnter={() => { setIsHovered(true); setTimelineHovered(true); }}
      onPointerLeave={() => { setIsHovered(false); setTimelineHovered(false); }}
      ref={containerRef}
    >
      {hasLiveTimeline && (
        <svg viewBox={`0 0 64 ${CH}`} className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <motion.path
            d={path}
            className="fill-foreground opacity-25"
          />
        </svg>
      )}

      {/* Invisible drag handle positioned exactly over the "fat bit".
          Withheld while viewing an archived chapter — the live timeline isn't what's on screen. */}
      {hasLiveTimeline && !isViewingEpoch && (
        <motion.div
          className="absolute cursor-grab active:cursor-grabbing touch-none flex items-center justify-center z-50"
          style={{ width: 120, height: 120, left: -28, top: -60, y }}
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
      )}

      {/* Floating Monospace Indicator */}
      {hasLiveTimeline && !isViewingEpoch && (isHovered || isDragging) && (
        <motion.div
          className="absolute right-full mr-4 text-[10px] uppercase font-ui bg-[var(--foreground)] text-[var(--background)] px-3 py-2 shadow-2xl pointer-events-none tracking-widest whitespace-nowrap"
          style={{ y: springY, top: -12 }}
        >
          {timeCursor === null ? "PRESENT" : `HISTORY: -${maxIndex - currentValue} TURNS`}
        </motion.div>
      )}

      {/* Chapters — archived epochs, stacked at the foot of the track (bottom = older).
          Sits above the drag handle so its clicks aren't swallowed. */}
      {epochs.length > 0 && (
        <div className="absolute bottom-2 left-0 right-0 z-[60] flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setViewingEpoch(null)}
            onPointerEnter={() => setHoveredChapterId('present')}
            onPointerLeave={() => setHoveredChapterId(null)}
            aria-label="Return to present"
            aria-current={!isViewingEpoch}
            className={`relative w-6 h-6 flex items-center justify-center font-ui text-[10px] uppercase tracking-widest transition-colors ${
              !isViewingEpoch ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-foreground/50 hover:text-foreground'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {hoveredChapterId === 'present' && (
              <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 text-[10px] uppercase font-ui bg-[var(--foreground)] text-[var(--background)] px-3 py-2 shadow-2xl pointer-events-none tracking-widest whitespace-nowrap">
                Present
              </span>
            )}
          </button>

          {[...epochs].reverse().map((epoch) => {
            const isActive = epoch.id === viewingEpochId;
            const label = String(epoch.index).padStart(2, '0');
            return (
              <button
                key={epoch.id}
                type="button"
                onClick={() => setViewingEpoch(isActive ? null : epoch.id)}
                onPointerEnter={() => setHoveredChapterId(epoch.id)}
                onPointerLeave={() => setHoveredChapterId(null)}
                aria-label={`View chapter ${epoch.index}: ${epoch.title}`}
                aria-current={isActive}
                className={`relative w-6 h-6 flex items-center justify-center font-ui text-[10px] uppercase tracking-widest transition-colors ${
                  isActive ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                {label}
                {hoveredChapterId === epoch.id && (
                  <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 text-[10px] uppercase font-ui bg-[var(--foreground)] text-[var(--background)] px-3 py-2 shadow-2xl pointer-events-none tracking-widest whitespace-nowrap">
                    {`CH ${label} — ${epoch.title}`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
