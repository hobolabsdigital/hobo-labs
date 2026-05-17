"use client";

import React, { useEffect, useRef } from 'react';
import { useViewport } from '@xyflow/react';
import { useTheme } from '@/core/theme/theme-provider';
import { getCanvasConfig, type CanvasConfig } from '@/core/theme/theme-canvas';

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
  color,
  repelRadius: repelRadiusProp,
  repelStrength: repelStrengthProp,
}: InteractiveGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { x, y, zoom } = useViewport();
  const { resolvedTheme } = useTheme();
  
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const retroGlowRef = useRef({ x: 0.5, y: 0.3 });
  const viewportRef = useRef({ x, y, zoom });

  // Update viewport ref without triggering effect teardown
  useEffect(() => {
    viewportRef.current = { x, y, zoom };
  }, [x, y, zoom]);

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
    
    // Get config from centralized theme-canvas — no theme name checks
    const cfg = getCanvasConfig(resolvedTheme ?? 'light');
    const gridColor = color ?? cfg.dotColor;
    const effectiveRepelRadius = repelRadiusProp ?? cfg.repelRadius;
    const effectiveRepelStrength = repelStrengthProp ?? cfg.repelStrength;

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

      // ── Background gradient (driven by config, not theme name) ──
      if (cfg.background === 'gradient' && cfg.gradientStops) {
        const nmx = mouseRef.current.x / (width || 1);
        const nmy = mouseRef.current.y / (height || 1);
        const glowLerp = 0.03;
        retroGlowRef.current.x += (nmx - retroGlowRef.current.x) * glowLerp;
        retroGlowRef.current.y += (nmy - retroGlowRef.current.y) * glowLerp;

        const baseGrad = ctx.createLinearGradient(0, height, 0, 0);
        for (const stop of cfg.gradientStops) {
          baseGrad.addColorStop(stop.offset, stop.color);
        }
        ctx.fillStyle = baseGrad;
        ctx.fillRect(0, 0, width, height);

        // Mouse-reactive glow
        if (cfg.glowColor) {
          const glowX = retroGlowRef.current.x * width;
          const glowY = retroGlowRef.current.y * height;
          const glowR = Math.max(width, height) * (cfg.glowRadius ?? 0.6);
          const radGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowR);
          radGrad.addColorStop(0, cfg.glowColor);
          radGrad.addColorStop(0.4, cfg.glowColor.replace(/[\d.]+\)$/, '0.15)'));
          radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = radGrad;
          ctx.fillRect(0, 0, width, height);
        }
      }
      
      const { x: vx, y: vy, zoom: vzoom } = viewportRef.current;
      
      const scaledGap = gap * vzoom;
      const offsetX = vx % scaledGap;
      const offsetY = vy % scaledGap;
      
      const startX = offsetX - scaledGap;
      const endX = width + scaledGap;
      const startY = offsetY - scaledGap;
      const endY = height + scaledGap;
      
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      
      const dotSize = size * vzoom;
      
      // ── Dot rendering (driven by cfg.dotShape, not theme name) ──
      ctx.beginPath();

      if (cfg.dotShape === 'construction-lines') {
        // Construction grid: full-span horizontal + vertical lines
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let px = startX; px < endX; px += scaledGap) {
          ctx.moveTo(px, 0);
          ctx.lineTo(px, height);
        }
        for (let py = startY; py < endY; py += scaledGap) {
          ctx.moveTo(0, py);
          ctx.lineTo(width, py);
        }
        ctx.stroke();
      } else if (cfg.dotShape === 'square') {
        // Square halftone dots, no mouse repel
        const dotW = Math.max(2, dotSize * 1.2);
        ctx.fillStyle = gridColor;
        for (let px = startX; px < endX; px += scaledGap) {
          for (let py = startY; py < endY; py += scaledGap) {
            ctx.fillRect(px - dotW / 2, py - dotW / 2, dotW, dotW);
          }
        }
      } else if (cfg.dotShape === 'round') {
        // Soft filled circles — repel but stay circular (no iron-filing stretch)
        const r = Math.max(3, dotSize * 1.5);
        ctx.fillStyle = gridColor;
        for (let px = startX; px < endX; px += scaledGap) {
          for (let py = startY; py < endY; py += scaledGap) {
            let drawX = px;
            let drawY = py;

            const dx = px - mx;
            const dy = py - my;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < effectiveRepelRadius && dist > 0) {
              const force = Math.pow((effectiveRepelRadius - dist) / effectiveRepelRadius, 2);
              drawX += (dx / dist) * force * effectiveRepelStrength * vzoom;
              drawY += (dy / dist) * force * effectiveRepelStrength * vzoom;
            }

            ctx.beginPath();
            ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        for (let px = startX; px < endX; px += scaledGap) {
          for (let py = startY; py < endY; py += scaledGap) {
            let drawX = px;
            let drawY = py;
            
            const dx = px - mx;
            const dy = py - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < effectiveRepelRadius) {
              const force = Math.pow((effectiveRepelRadius - dist) / effectiveRepelRadius, 2); 
              drawX += (dx / dist) * force * effectiveRepelStrength * vzoom;
              drawY += (dy / dist) * force * effectiveRepelStrength * vzoom;
              
              if (cfg.dotShape === 'crosshair') {
                const crossSize = 3 * vzoom;
                ctx.moveTo(drawX - crossSize, drawY);
                ctx.lineTo(drawX + crossSize, drawY);
                ctx.moveTo(drawX, drawY - crossSize);
                ctx.lineTo(drawX, drawY + crossSize);
              } else {
                // 'line': iron filing rotation/stretch
                const angle = Math.atan2(dy, dx);
                const stretch = force * 8 * vzoom;
                const lx = Math.cos(angle) * stretch;
                const ly = Math.sin(angle) * stretch;
                
                ctx.moveTo(drawX - lx, drawY - ly);
                ctx.lineTo(drawX + lx, drawY + ly);
              }
            } else {
              if (cfg.dotShape === 'crosshair') {
                const crossSize = 3 * vzoom;
                ctx.moveTo(drawX - crossSize, drawY);
                ctx.lineTo(drawX + crossSize, drawY);
                ctx.moveTo(drawX, drawY - crossSize);
                ctx.lineTo(drawX, drawY + crossSize);
              } else {
                // Standard dot
                ctx.moveTo(drawX, drawY);
                ctx.lineTo(drawX, drawY);
              }
            }
          }
        }
      }

      if (cfg.dotShape !== 'square' && cfg.dotShape !== 'round' && cfg.dotShape !== 'construction-lines') {
        ctx.lineCap = 'round';
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = dotSize;
        ctx.stroke();
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [gap, size, repelRadiusProp, repelStrengthProp, color, resolvedTheme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-[-1]"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
