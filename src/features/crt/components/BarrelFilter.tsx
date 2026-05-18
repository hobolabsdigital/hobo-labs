"use client";

import { useEffect, useRef } from "react";
import { useCrtStore } from "../store/useCrtStore";

/**
 * CRT curvature simulation.
 * 
 * TRUE barrel distortion requires rendering the entire page to a WebGL texture
 * and remapping UV coordinates in a fragment shader. This is impossible for
 * our app because:
 * - VFX-JS can't handle ReactFlow's transformed coordinate system
 * - html2canvas can't capture WebGL canvases at 60fps
 * - SVG feDisplacementMap only shifts pixels linearly, it can't curve them
 * 
 * Instead, we simulate CRT curvature with a CSS overlay that creates the 
 * visual impression of curved glass: radial gradient darkening at edges,
 * rounded corners, and inset shadow depth. Combined with the WebGL grain
 * canvas (vignette + grain), this creates a convincing CRT atmosphere.
 * 
 * The SVG chromatic aberration filter (RGB channel splitting) does work
 * correctly for real pixel-level effects and is kept.
 */

export function BarrelFilter() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;

    function update() {
      const config = useCrtStore.getState().crtConfig;

      // Update CRT curvature overlay
      if (overlayRef.current) {
        if (!config.enabled || config.barrelStrength === 0) {
          overlayRef.current.style.opacity = "0";
        } else {
          const s = config.barrelStrength / 100; // 0-1
          overlayRef.current.style.opacity = "1";

          // Edge darkening increases with curvature strength
          const edgeAlpha = 0.1 + s * 0.6;
          // Highlight shrinks with more curvature
          const highlightPct = 85 - s * 40;
          // Rounded corners simulate curved glass edges
          const radius = s * 18;
          // Inset shadow creates depth
          const inset = Math.round(s * 100);
          const insetSpread = Math.round(inset * 0.35);

          overlayRef.current.style.background = `
            radial-gradient(
              ellipse ${highlightPct}% ${highlightPct}% at 50% 50%,
              transparent 0%,
              rgba(0, 0, 0, ${edgeAlpha * 0.2}) 55%,
              rgba(0, 0, 0, ${edgeAlpha * 0.5}) 80%,
              rgba(0, 0, 0, ${edgeAlpha}) 100%
            )
          `;
          overlayRef.current.style.borderRadius = `${radius}px`;
          overlayRef.current.style.boxShadow =
            `inset 0 0 ${inset}px ${insetSpread}px rgba(0, 0, 0, ${edgeAlpha * 0.4})`;
        }
      }

      raf = requestAnimationFrame(update);
    }

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* CRT curvature overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9998, opacity: 0 }}
      />

    </>
  );
}
