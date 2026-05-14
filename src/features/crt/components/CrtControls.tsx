"use client";

import { useCrtStore, DEFAULT_CRT_CONFIG } from "../store/useCrtStore";

/**
 * Standalone CRT debug controls panel.
 * Left-side slide-out, separate from the Playground (DebugPanel).
 * Matches the brutalist mono aesthetic.
 */
export function CrtControls() {
  const isCrtPanelOpen = useCrtStore((s) => s.isCrtPanelOpen);
  const setCrtPanelOpen = useCrtStore((s) => s.setCrtPanelOpen);
  const config = useCrtStore((s) => s.crtConfig);
  const setConfig = useCrtStore((s) => s.setCrtConfig);
  const crtMode = useCrtStore((s) => s.crtMode);
  const setCrtMode = useCrtStore((s) => s.setCrtMode);
  const experimentalSupported = useCrtStore((s) => s.experimentalSupported);

  return (
    <div
      className={`fixed top-20 left-0 z-50 transition-transform duration-300 ${
        isCrtPanelOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Tab button */}
      <button
        onClick={() => setCrtPanelOpen(!isCrtPanelOpen)}
        className="bg-[var(--foreground)] text-[var(--background)] px-3 py-1 text-xs font-mono absolute left-[100%] top-0 hover:opacity-80 transition-all duration-300 whitespace-nowrap ml-4"
      >
        [ CRT ]
      </button>

      {/* Panel body */}
      <div className="bg-[var(--background)] border border-[var(--foreground)] border-l-0 p-4 shadow-2xl flex flex-col gap-4 font-mono w-72 max-h-[90vh] overflow-y-auto">
        {/* Master toggle */}
        <div className="flex items-center justify-between border-b border-[var(--foreground)] pb-3">
          <h3 className="text-xs uppercase tracking-wider font-bold">CRT Effect</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[10px] uppercase">{config.enabled ? "ON" : "OFF"}</span>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ enabled: e.target.checked })}
              className="w-3 h-3 accent-[var(--foreground)]"
            />
          </label>
        </div>

        {/* Rendering Mode indicator */}
        <div className="flex items-center justify-between border-b border-[var(--foreground)] pb-3">
          <div>
            <h4 className="text-[10px] uppercase tracking-wider font-bold">Mode</h4>
            <span className="text-[9px] uppercase opacity-60">
              {crtMode === "experimental" ? "Experimental (GPU)" : "Standard (CSS)"}
            </span>
          </div>
          {experimentalSupported && (
            <button
              onClick={() => setCrtMode(crtMode === "experimental" ? "standard" : "experimental")}
              className="text-[9px] uppercase border border-[var(--foreground)] px-2 py-1 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
            >
              Switch
            </button>
          )}
        </div>

        {/* CRT Curvature */}
        <div className="flex flex-col gap-2 border-b border-[var(--foreground)] pb-3">
          <h4 className="text-[10px] uppercase tracking-wider font-bold">CRT Curvature</h4>
          <Slider
            label="Strength"
            value={config.barrelStrength}
            min={0}
            max={100}
            step={1}
            onChange={(v) => setConfig({ barrelStrength: v })}
            format={(v) => v + "%"}
          />
        </div>

        {/* Chromatic Aberration */}
        <div className="flex flex-col gap-2 border-b border-[var(--foreground)] pb-3">
          <h4 className="text-[10px] uppercase tracking-wider font-bold">Chromatic Aberration</h4>
          <Slider
            label="Offset"
            value={config.aberrationOffset}
            min={0}
            max={5}
            step={0.1}
            onChange={(v) => setConfig({ aberrationOffset: v })}
            format={(v) => v.toFixed(1) + "px"}
          />
        </div>

        {/* Vignette */}
        <div className="flex flex-col gap-2 border-b border-[var(--foreground)] pb-3">
          <h4 className="text-[10px] uppercase tracking-wider font-bold">Vignette</h4>
          <Slider
            label="Strength"
            value={config.vignetteStrength}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => setConfig({ vignetteStrength: v })}
            format={(v) => v.toFixed(2)}
          />
          <Slider
            label="Radius"
            value={config.vignetteRadius}
            min={0.1}
            max={1.5}
            step={0.05}
            onChange={(v) => setConfig({ vignetteRadius: v })}
            format={(v) => v.toFixed(2)}
          />
        </div>

        {/* Film Grain */}
        <div className="flex flex-col gap-2 border-b border-[var(--foreground)] pb-3">
          <h4 className="text-[10px] uppercase tracking-wider font-bold">Film Grain</h4>
          <Slider
            label="Opacity"
            value={config.grainOpacity}
            min={0}
            max={0.3}
            step={0.005}
            onChange={(v) => setConfig({ grainOpacity: v })}
            format={(v) => v.toFixed(3)}
          />
          <Slider
            label="Speed"
            value={config.grainSpeed}
            min={0.1}
            max={5}
            step={0.1}
            onChange={(v) => setConfig({ grainSpeed: v })}
            format={(v) => v.toFixed(1) + "x"}
          />
        </div>

        {/* Border / Corners — experimental only */}
        {crtMode === "experimental" && (
          <div className="flex flex-col gap-2 border-b border-[var(--foreground)] pb-3">
            <h4 className="text-[10px] uppercase tracking-wider font-bold">CRT Border</h4>
            <Slider
              label="Corner Radius"
              value={config.cornerRadius}
              min={0}
              max={0.5}
              step={0.01}
              onChange={(v) => setConfig({ cornerRadius: v })}
              format={(v) => v.toFixed(2)}
            />
            <Slider
              label="Edge Softness"
              value={config.edgeSoftness}
              min={0}
              max={0.3}
              step={0.01}
              onChange={(v) => setConfig({ edgeSoftness: v })}
              format={(v) => v.toFixed(2)}
            />
            <Slider
              label="Top Darken"
              value={config.topDarken}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setConfig({ topDarken: v })}
              format={(v) => v.toFixed(2)}
            />
          </div>
        )}

        {/* Reset button */}
        <button
          onClick={() => setConfig({ ...DEFAULT_CRT_CONFIG })}
          className="w-full py-2 border border-[var(--foreground)] text-[var(--foreground)] text-[10px] font-bold uppercase hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
        >
          Reset Defaults
        </button>
      </div>
    </div>
  );
}

/** Reusable slider matching the brutalist style of DebugPanel */
function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px]">
        <label>{label}</label>
        <span>{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--foreground)]"
      />
    </div>
  );
}
