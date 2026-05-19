"use client";

import { useCrtStore, DEFAULT_CRT_CONFIG } from '@/features/crt/store/useCrtStore';
import { Section } from './Section';
import { Slider } from './Slider';

export function CrtDebugControls() {
  const crtConfig = useCrtStore((s) => s.crtConfig);
  const setCrtConfig = useCrtStore((s) => s.setCrtConfig);
  const crtMode = useCrtStore((s) => s.crtMode);
  const setCrtMode = useCrtStore((s) => s.setCrtMode);
  const experimentalSupported = useCrtStore((s) => s.experimentalSupported);

  return (
    <Section title="CRT Effect">
      {/* Master toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase">Enabled</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-[10px] uppercase opacity-60">{crtConfig.enabled ? "ON" : "OFF"}</span>
          <input
            type="checkbox"
            checked={crtConfig.enabled}
            onChange={(e) => setCrtConfig({ enabled: e.target.checked })}
            className="w-3 h-3 accent-[var(--foreground)]"
          />
        </label>
      </div>

      {/* Mode */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase opacity-60">
          {crtMode === "experimental" ? "Experimental (GPU)" : "Standard (CSS)"}
        </span>
        {experimentalSupported && (
          <button
            onClick={() => setCrtMode(crtMode === "experimental" ? "standard" : "experimental")}
            className="text-[9px] uppercase border border-[var(--foreground)]/30 px-2 py-0.5 hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
          >
            Switch
          </button>
        )}
      </div>

      {/* Curvature */}
      <Slider label="Curvature" value={crtConfig.barrelStrength} min={0} max={100} step={1}
        onChange={(v) => setCrtConfig({ barrelStrength: v })} format={(v) => v + "%"} />

      {/* Vignette */}
      <Slider label="Vignette Strength" value={crtConfig.vignetteStrength} min={0} max={1} step={0.01}
        onChange={(v) => setCrtConfig({ vignetteStrength: v })} format={(v) => v.toFixed(2)} />
      <Slider label="Vignette Radius" value={crtConfig.vignetteRadius} min={0.1} max={1.5} step={0.05}
        onChange={(v) => setCrtConfig({ vignetteRadius: v })} format={(v) => v.toFixed(2)} />

      {/* Experimental-only controls */}
      {crtMode === "experimental" && (
        <>
          <Slider label="Corner Radius" value={crtConfig.cornerRadius} min={0} max={0.5} step={0.01}
            onChange={(v) => setCrtConfig({ cornerRadius: v })} format={(v) => v.toFixed(2)} />
          <Slider label="Edge Softness" value={crtConfig.edgeSoftness} min={0} max={0.3} step={0.01}
            onChange={(v) => setCrtConfig({ edgeSoftness: v })} format={(v) => v.toFixed(2)} />
          <Slider label="Top Darken" value={crtConfig.topDarken} min={0} max={1} step={0.01}
            onChange={(v) => setCrtConfig({ topDarken: v })} format={(v) => v.toFixed(2)} />
        </>
      )}

      {/* Reset */}
      <button
        onClick={() => setCrtConfig({ ...DEFAULT_CRT_CONFIG })}
        className="w-full py-1.5 border border-[var(--foreground)]/30 text-[var(--foreground)] text-[9px] font-bold uppercase hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
      >
        Reset CRT Defaults
      </button>
    </Section>
  );
}
