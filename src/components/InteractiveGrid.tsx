"use client";

import React, { useEffect, useRef } from 'react';
import { useViewport } from '@xyflow/react';
import { useTheme } from '@/components/theme-provider';

interface InteractiveGridProps {
  gap?: number;
  size?: number;
  color?: string;
  repelRadius?: number;
  repelStrength?: number;
}

export function InteractiveGrid({
  gap = 24,
  size = 2,
  color = 'var(--grid-color)',
  repelRadius = 150,
  repelStrength = 20,
}: InteractiveGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { x, y, zoom } = useViewport();
  const { resolvedTheme } = useTheme();
  
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', handlePointerMove, { capture: true });
    return () => window.removeEventListener('pointermove', handlePointerMove, { capture: true });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let animationFrameId: number;
    let width = 0;
    let height = 0;
    
    const isDark = resolvedTheme === 'dark';
    const gridColor = color === 'var(--grid-color)' 
      ? (isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.35)') 
      : color;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
      }
    });
    
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, width, height);
      
      const scaledGap = gap * zoom;
      const offsetX = x % scaledGap;
      const offsetY = y % scaledGap;
      
      const startX = offsetX - scaledGap;
      const endX = width + scaledGap;
      const startY = offsetY - scaledGap;
      const endY = height + scaledGap;
      
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      
      const dotSize = size * zoom;
      
      ctx.beginPath();
      for (let px = startX; px < endX; px += scaledGap) {
        for (let py = startY; py < endY; py += scaledGap) {
          let drawX = px;
          let drawY = py;
          
          const dx = px - mx;
          const dy = py - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < repelRadius) {
            // Inverse square dropoff for natural magnetic feel
            const force = Math.pow((repelRadius - dist) / repelRadius, 2); 
            
            // Displacement
            drawX += (dx / dist) * force * repelStrength * zoom;
            drawY += (dy / dist) * force * repelStrength * zoom;
            
            // Iron filing rotation/stretch
            const angle = Math.atan2(dy, dx);
            const stretch = force * 8 * zoom; // Stretch amount
            const lx = Math.cos(angle) * stretch;
            const ly = Math.sin(angle) * stretch;
            
            ctx.moveTo(drawX - lx, drawY - ly);
            ctx.lineTo(drawX + lx, drawY + ly);
          } else {
            // Standard dot
            ctx.moveTo(drawX, drawY);
            ctx.lineTo(drawX, drawY);
          }
        }
      }
      
      ctx.lineCap = 'round';
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = dotSize;
      ctx.stroke();
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [x, y, zoom, gap, size, repelRadius, repelStrength, color, resolvedTheme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-[-1]"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
