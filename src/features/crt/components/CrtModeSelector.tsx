"use client";

import { useEffect, useState } from "react";
import { useCrtStore, detectDrawElementImage } from "../store/useCrtStore";

/**
 * CRT mode selector popup.
 * 
 * Auto-detects if drawElementImage is available (Chrome flag).
 * If experimental is supported: shows choice between Standard and Experimental.
 * If not supported: auto-selects Standard mode silently.
 */
export function CrtModeSelector() {
  const crtMode = useCrtStore((s) => s.crtMode);
  const setCrtMode = useCrtStore((s) => s.setCrtMode);
  const setExperimentalSupported = useCrtStore((s) => s.setExperimentalSupported);

  // Local state for rendering — drives the popup visibility
  const [detected, setDetected] = useState<boolean | null>(null);

  useEffect(() => {
    const supported = detectDrawElementImage();
    console.log("[CRT ModeSelector] Detection result:", supported, "Current mode:", crtMode);
    setExperimentalSupported(supported);
    setDetected(supported);

    // If not supported, auto-select standard (no popup)
    if (!supported) {
      setCrtMode("standard");
    }
  }, []); // Run once on mount

  // Still detecting
  if (detected === null) return null;

  // Not supported, auto-selected standard
  if (!detected) return null;

  // Already chose a mode
  if (crtMode !== null) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm">
      <div
        className="bg-[var(--background)] border-2 border-[var(--foreground)] p-8 max-w-md w-full mx-4 font-ui"
        style={{ boxShadow: "8px 8px 0 var(--foreground)" }}
      >
        {/* Header */}
        <div className="border-b border-[var(--foreground)] pb-4 mb-6">
          <h2 className="text-sm uppercase tracking-widest font-bold">
            [ CRT RENDERING MODE ]
          </h2>
          <p className="text-[10px] mt-2 opacity-60 uppercase tracking-wider">
            Experimental features detected
          </p>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed mb-6 opacity-80">
          Your browser supports{" "}
          <span className="font-bold">drawElementImage</span> — an experimental
          Chrome API that enables real-time barrel distortion with pixel-perfect
          CRT curvature on live DOM content.
        </p>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {/* Experimental */}
          <button
            onClick={() => setCrtMode("experimental")}
            className="w-full p-4 border-2 border-[var(--foreground)] text-left hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Experimental
              </span>
              <span className="text-[9px] uppercase tracking-wider opacity-50 group-hover:opacity-100">
                Chrome 136+
              </span>
            </div>
            <p className="text-[10px] opacity-60 group-hover:opacity-80">
              Real barrel distortion via GPU shader. Captures live DOM to WebGL
              texture at 60fps. True CRT curvature.
            </p>
          </button>

          {/* Standard */}
          <button
            onClick={() => setCrtMode("standard")}
            className="w-full p-4 border border-[var(--foreground)] text-left hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Standard
              </span>
              <span className="text-[9px] uppercase tracking-wider opacity-50 group-hover:opacity-100">
                All Browsers
              </span>
            </div>
            <p className="text-[10px] opacity-60 group-hover:opacity-80">
              CSS vignette, film grain, chromatic aberration. No geometric
              warping. Universal compatibility.
            </p>
          </button>
        </div>

        {/* Footer */}
        <p className="text-[9px] mt-5 opacity-40 uppercase tracking-wider text-center">
          You can switch modes anytime in the CRT debug panel
        </p>
      </div>
    </div>
  );
}
