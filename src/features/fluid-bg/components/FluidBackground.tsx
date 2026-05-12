import { useEffect, useRef } from "react";
import WebGLFluid from '@/features/fluid-bg/lib/fluid';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 1.0, g: 1.0, b: 1.0 };
}

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fluidRef = useRef<{ config: Record<string, unknown>; destroy: () => void } | null>(null);

  const isTimelineHovered = useCanvasStore((state) => state.isTimelineHovered);
  const isTimelineHoveredRef = useRef(isTimelineHovered);

  const fluidConfig = useCanvasStore((state) => state.fluidConfig);
  const fluidConfigRef = useRef(fluidConfig);

  useEffect(() => {
    isTimelineHoveredRef.current = isTimelineHovered;
  }, [isTimelineHovered]);

  useEffect(() => {
    fluidConfigRef.current = fluidConfig;
    if (fluidRef.current) {
      const config = fluidRef.current.config;
      config.DENSITY_DISSIPATION = fluidConfig.DENSITY_DISSIPATION;
      config.VELOCITY_DISSIPATION = fluidConfig.VELOCITY_DISSIPATION;
      config.PRESSURE = fluidConfig.PRESSURE;
      config.CURL = fluidConfig.CURL;
      config.SPLAT_FORCE = fluidConfig.SPLAT_FORCE;
      config.ABERRATION_MULT = fluidConfig.ABERRATION_MULT;
      config.SPLAT_COLOR = hexToRgb(fluidConfig.SPLAT_COLOR);
    }
  }, [fluidConfig]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize fluid
    fluidRef.current = WebGLFluid(canvasRef.current, {
      TRIGGER: 'hover',
      IMMEDIATE: false,
      AUTO: false,
      COLORFUL: false, // Turn off random colors
      SHADING: false, // Disable 3D lighting so the fluid is perfectly flat and vector-like
      TRANSPARENT: true,
      BLOOM: false, // Turn off internal bloom for crisper edges
      SUNRAYS: false,
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 512,
      ...fluidConfigRef.current,
      SPLAT_COLOR: hexToRgb(fluidConfigRef.current.SPLAT_COLOR) // Override the hex string from controls
    });

    let animationFrameId: number;
    let isPressed = false;

    // Track mouse velocity for chromatic aberration
    let mouseX = 0;
    let mouseY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let velocityX = 0;
    let velocityY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    };

    const handlePointerDown = () => { isPressed = true; };
    const handlePointerUp = () => { isPressed = false; };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    function update() {
      if (fluidRef.current) {
        const c = fluidConfigRef.current;
        const config = fluidRef.current.config;

        // Calculate normalized velocity
        velocityX = (mouseX - lastMouseX);
        velocityY = (mouseY - lastMouseY);
        lastMouseX = mouseX;
        lastMouseY = mouseY;

        // Pass velocity and aberration to the patched fluid shader
        config.mouseX = velocityX;
        config.mouseY = -velocityY; // Flip Y for WebGL coordinates
        config.ABERRATION_MULT = c.ABERRATION_MULT;

        // Handle swell and magnetism
        let targetRadius = c.SPLAT_RADIUS;
        if (isTimelineHoveredRef.current) {
          targetRadius = c.MAGNETIC_RADIUS;
        } else if (isPressed) {
          targetRadius = c.SPLAT_RADIUS * c.SWELL_MULT;
        }

        // Smoothly lerp the radius so it doesn't jump instantly
        const currentRadius = typeof config.SPLAT_RADIUS === 'number' ? config.SPLAT_RADIUS : targetRadius;
        config.SPLAT_RADIUS = currentRadius + (targetRadius - currentRadius) * 0.15;

        if (c.COLOR_CYCLE) {
          const time = Date.now() * 0.001 * c.COLOR_CYCLE_SPEED;
          config.SPLAT_COLOR = {
            r: Math.sin(time) * 0.5 + 0.5,
            g: Math.sin(time + 2.094) * 0.5 + 0.5, // 120 degrees phase shift
            b: Math.sin(time + 4.188) * 0.5 + 0.5  // 240 degrees phase shift
          };
        } else {
          config.SPLAT_COLOR = hexToRgb(c.SPLAT_COLOR);
        }
      }
      animationFrameId = requestAnimationFrame(update);
    }

    update();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      if (fluidRef.current && fluidRef.current.destroy) {
        fluidRef.current.destroy();
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        mixBlendMode: "difference",
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-none"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      />
    </div>
  );
}
