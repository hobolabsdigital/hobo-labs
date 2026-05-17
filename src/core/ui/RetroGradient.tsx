"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/core/theme/theme-provider";

/**
 * Full-viewport tropical gradient that follows the mouse cursor.
 * Only renders when the retro theme is active.
 * 
 * The gradient is a warm peach→gold→mint spectrum with a radial
 * highlight that drifts toward the mouse position — like sunlight
 * shifting through a tropical canopy.
 */
export function RetroGradient() {
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.3 }); // normalized 0-1
  const targetRef = useRef({ x: 0.5, y: 0.3 });
  const rafRef = useRef<number>(0);

  const isRetro = resolvedTheme === "retro";

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Smooth lerp toward target (lazy drift, not snappy)
    const lerp = 0.03;
    mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * lerp;
    mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * lerp;

    const mx = mouseRef.current.x * w;
    const my = mouseRef.current.y * h;

    // Base gradient: vertical Miami tropical spectrum (bottom coral → top aqua)
    const baseGrad = ctx.createLinearGradient(0, h, 0, 0);
    baseGrad.addColorStop(0, "#FFB088");   // warm peach/salmon
    baseGrad.addColorStop(0.3, "#FFC8A8"); // soft coral
    baseGrad.addColorStop(0.55, "#E8E0C8"); // warm neutral bridge
    baseGrad.addColorStop(0.8, "#B8E0E8"); // pale aqua
    baseGrad.addColorStop(1, "#A0D8E8");   // baby blue/aqua

    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, w, h);

    // Mouse-reactive warm radial glow
    const radius = Math.max(w, h) * 0.6;
    const radGrad = ctx.createRadialGradient(mx, my, 0, mx, my, radius);
    radGrad.addColorStop(0, "rgba(255, 150, 120, 0.3)");   // warm sunset pink center
    radGrad.addColorStop(0.4, "rgba(255, 180, 140, 0.15)"); // peach fade
    radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");            // transparent

    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    if (!isRetro) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size canvas to viewport
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Track mouse
    const onMouseMove = (e: MouseEvent) => {
      targetRef.current.x = e.clientX / window.innerWidth;
      targetRef.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Start render loop
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isRetro, draw]);

  if (!isRetro) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
