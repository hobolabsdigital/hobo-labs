"use client";

import { useCrtStore } from "../store/useCrtStore";
import { BarrelFilter } from "./BarrelFilter";
import { ExperimentalBarrel } from "./ExperimentalBarrel";
import { GrainCanvas } from "./GrainCanvas";
import { CrtModeSelector } from "./CrtModeSelector";
import { useMediaQuery } from "@/core/hooks/useMediaQuery";

/**
 * CRT post-processing effect suite.
 * 
 * Two rendering modes:
 * 
 * STANDARD (all browsers):
 * - BarrelFilter: CSS curvature overlay + SVG chromatic aberration
 * - GrainCanvas: WebGL vignette + film grain
 * 
 * EXPERIMENTAL (Chrome with drawElementImage flag):
 * - ExperimentalBarrel: Real barrel distortion via GPU shader on live DOM
 * - GrainCanvas: disabled (the shader handles vignette + grain)
 * 
 * CrtModeSelector: popup shown once to let the user choose.
 * Controls are now in the Playground panel (DebugPanel).
 */
export function CrtEffect() {
  const crtMode = useCrtStore((s) => s.crtMode);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Disable CRT effects entirely on mobile devices for readability and performance
  if (isMobile) {
    return null;
  }

  return (
    <>
      {/* Mode selection popup (shown once if experimental is available) */}
      <CrtModeSelector />

      {/* Standard mode: CSS overlay + SVG filter + WebGL grain */}
      {crtMode === "standard" && (
        <>
          <BarrelFilter />
          <GrainCanvas />
        </>
      )}

      {/* Experimental mode: drawElementImage barrel distortion */}
      {/* The barrel shader handles vignette + grain internally, no GrainCanvas needed */}
      {crtMode === "experimental" && <ExperimentalBarrel />}
    </>
  );
}
