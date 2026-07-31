"use client";

import { BarrelFilter } from "./BarrelFilter";
import { GrainCanvas } from "./GrainCanvas";
import { useMediaQuery } from "@/core/hooks/useMediaQuery";

/**
 * CRT post-processing effect suite.
 *
 * - BarrelFilter: CSS curvature overlay + SVG chromatic aberration
 * - GrainCanvas: WebGL vignette + film grain
 *
 * Controls live in the Playground panel (DebugPanel).
 */
export function CrtEffect() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Disable CRT effects entirely on mobile devices for readability and performance
  if (isMobile) {
    return null;
  }

  return (
    <>
      <BarrelFilter />
      <GrainCanvas />
    </>
  );
}
