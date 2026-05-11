"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCanvasStore } from "@/store/useCanvasStore";

export function TimelineScrubber() {
  const nodes = useCanvasStore((state) => state.nodes);
  const timeCursor = useCanvasStore((state) => state.timeCursor);
  const setTimeCursor = useCanvasStore((state) => state.setTimeCursor);
  const setTimelineHovered = useCanvasStore((state) => state.setTimelineHovered);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseY, setMouseY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // If there are less than 2 nodes, history scrubbing doesn't make much sense.
  if (nodes.length <= 1) return null;

  const maxIndex = nodes.length - 1;
  const currentValue = timeCursor !== null ? timeCursor : maxIndex;

  const calculateAndSetCursor = (y: number, rectHeight: number) => {
    // The track is inset by 48px top and bottom
    const trackHeight = rectHeight - 96;
    const trackY = y - 48;
    
    // Top = maxIndex, Bottom = 0
    let ratio = 1 - (trackY / trackHeight);
    ratio = Math.max(0, Math.min(ratio, 1));
    
    const targetIndex = Math.round(ratio * maxIndex);
    if (targetIndex === maxIndex) {
      setTimeCursor(null);
    } else {
      setTimeCursor(targetIndex);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    setMouseY(y);

    if (isDragging) {
      calculateAndSetCursor(y, rect.height);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    calculateAndSetCursor(y, rect.height);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setTimelineHovered(false);
    setMouseY(null);
  };

  // Create ticks array for the ruler
  const ticks = Array.from({ length: maxIndex + 1 });

  return (
    <div 
      className="absolute right-0 top-0 h-full w-16 z-50 flex justify-center group border-l border-foreground/10 bg-background/50 backdrop-blur-md touch-none cursor-ns-resize"
      onPointerEnter={() => { setIsHovered(true); setTimelineHovered(true); }}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      ref={containerRef}
    >
      {/* Track Container */}
      <div className="absolute inset-y-12 left-0 right-0 pointer-events-none flex flex-col-reverse justify-between">
        {ticks.map((_, i) => {
          const isPast = i > currentValue;
          const isCurrent = i === currentValue;
          
          let scale = 1;
          let widthClass = isPast ? 'w-1/3' : 'w-2/3';
          
          // Mac Dock Magnification Math
          if (mouseY !== null && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const trackHeight = rect.height - 96;
            const tickY = 48 + (1 - i / maxIndex) * trackHeight;
            const distance = Math.abs(mouseY - tickY);
            
            if (distance < 50) {
               const magnification = 1 - (distance / 50);
               scale = 1 + magnification * 3; // Up to 4x thicker
               widthClass = 'w-full';
            }
          }

          return (
            <div key={i} className="w-full flex items-center justify-end pr-4 h-2">
              <div 
                className={`transition-all duration-75 origin-right ${
                  isCurrent ? 'bg-foreground shadow-[0_0_10px_rgba(0,0,0,0.5)] dark:shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 
                  isPast ? 'bg-muted-foreground/30' : 'bg-foreground/60'
                } ${isCurrent ? 'w-full' : widthClass}`}
                style={{ height: `${Math.max(1, scale)}px` }}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Monospace Indicator */}
      {isHovered && timeCursor !== null && (
        <div 
          className="absolute right-full mr-4 text-[10px] uppercase font-mono bg-foreground text-background px-3 py-2 shadow-2xl pointer-events-none tracking-widest whitespace-nowrap"
          style={{ 
            top: mouseY !== null ? mouseY : '50%', 
            transform: 'translateY(-50%)' 
          }}
        >
          HISTORY: -{(maxIndex - currentValue)} TURNS
        </div>
      )}
    </div>
  );
}
