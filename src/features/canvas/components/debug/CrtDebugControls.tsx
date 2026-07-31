"use client";

import { useCrtStore, DEFAULT_CRT_CONFIG } from '@/features/crt/store/useCrtStore';
import { Section } from './Section';
import { Slider } from './Slider';

export function CrtDebugControls() {
  const crtConfig = useCrtStore((s) => s.crtConfig);
  const setCrtConfig = useCrtStore((s) => s.setCrtConfig);

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

      {/* Curvature */}
      <Slider label="Curvature" value={crtConfig.barrelStrength} min={0} max={100} step={1}
        onChange={(v) => setCrtConfig({ barrelStrength: v })} format={(v) => v + "%"} />

      {/* Vignette */}
      <Slider label="Vignette Strength" value={crtConfig.vignetteStrength} min={0} max={1} step={0.01}
        onChange={(v) => setCrtConfig({ vignetteStrength: v })} format={(v) => v.toFixed(2)} />
      <Slider label="Vignette Radius" value={crtConfig.vignetteRadius} min={0.1} max={1.5} step={0.05}
        onChange={(v) => setCrtConfig({ vignetteRadius: v })} format={(v) => v.toFixed(2)} />

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
