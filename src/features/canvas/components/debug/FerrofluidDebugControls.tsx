"use client";

import { useFerrofluidStore } from '@/features/ferrofluid/store/useFerrofluidStore';
import { Section } from './Section';
import { Slider } from './Slider';

export function FerrofluidDebugControls() {
  const ferrofluidConfig = useFerrofluidStore(s => s.config);
  const setFerrofluidConfig = useFerrofluidStore(s => s.setConfig);
  const isPlaying = useFerrofluidStore(s => s.isPlaying);
  const toggleAudioFn = useFerrofluidStore(s => s.toggleAudioFn);

  return (
    <Section title="Ferrofluid Physics">
      <button
        onClick={() => toggleAudioFn?.()}
        className="w-full py-1.5 border border-[var(--foreground)]/30 text-[var(--foreground)] text-[9px] font-bold uppercase hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors mb-2"
      >
        {isPlaying ? "Pause Audio" : "Play Audio"}
      </button>

      <Slider label="Noise Speed" value={ferrofluidConfig.noiseSpeed} min={0} max={0.01} step={0.00001}
        onChange={(v) => setFerrofluidConfig({ noiseSpeed: v })} format={(v) => v.toFixed(5)} />
      <Slider label="Noise Scale" value={ferrofluidConfig.noiseScale} min={0.1} max={5.0} step={0.1}
        onChange={(v) => setFerrofluidConfig({ noiseScale: v })} format={(v) => v.toFixed(1)} />
      <Slider label="Spike Height" value={ferrofluidConfig.spikeHeight} min={0.0} max={1.0} step={0.01}
        onChange={(v) => setFerrofluidConfig({ spikeHeight: v })} format={(v) => v.toFixed(2)} />
      <Slider label="Audio Multiplier" value={ferrofluidConfig.audioMultiplier} min={0.0} max={5.0} step={0.1}
        onChange={(v) => setFerrofluidConfig({ audioMultiplier: v })} format={(v) => v.toFixed(1)} />
      <Slider label="Camera Z" value={ferrofluidConfig.cameraZ} min={2.0} max={10.0} step={0.1}
        onChange={(v) => setFerrofluidConfig({ cameraZ: v })} format={(v) => v.toFixed(1)} />
      <Slider label="Zoom Amount" value={ferrofluidConfig.zoomAmount} min={0.0} max={5.0} step={0.1}
        onChange={(v) => setFerrofluidConfig({ zoomAmount: v })} format={(v) => v.toFixed(1)} />
      <Slider label="Parallax Amount" value={ferrofluidConfig.parallaxAmount} min={0.0} max={2.0} step={0.1}
        onChange={(v) => setFerrofluidConfig({ parallaxAmount: v })} format={(v) => v.toFixed(1)} />
      <Slider label="Orbit Amount" value={ferrofluidConfig.orbitAmount} min={0.0} max={2.0} step={0.1}
        onChange={(v) => setFerrofluidConfig({ orbitAmount: v })} format={(v) => v.toFixed(1)} />

      <div className="flex items-center justify-between pt-1">
        <label htmlFor="mouse-tracking-mode" className="text-[10px] uppercase tracking-wider">Mouse Tracking</label>
        <input
          type="checkbox" id="mouse-tracking-mode"
          checked={ferrofluidConfig.enableMouseTracking}
          onChange={(e) => setFerrofluidConfig({ enableMouseTracking: e.target.checked })}
          className="w-3 h-3 accent-[var(--foreground)]"
        />
      </div>

      <Slider label="Mouse Influence" value={ferrofluidConfig.mouseInfluence} min={0.1} max={2.0} step={0.1}
        onChange={(v) => setFerrofluidConfig({ mouseInfluence: v })} format={(v) => v.toFixed(1)} />
      <Slider label="Mouse Pull Strength" value={ferrofluidConfig.mousePullStrength} min={0.0} max={2.0} step={0.05}
        onChange={(v) => setFerrofluidConfig({ mousePullStrength: v })} format={(v) => v.toFixed(2)} />

      <Slider label="Canvas Opacity" value={ferrofluidConfig.canvasOpacity} min={0.0} max={1.0} step={0.01}
        onChange={(v) => setFerrofluidConfig({ canvasOpacity: v })} format={(v) => v.toFixed(2)} />
      <Slider label="DoF Strength" value={ferrofluidConfig.dofStrength} min={0.0} max={2.0} step={0.1}
        onChange={(v) => setFerrofluidConfig({ dofStrength: v })} format={(v) => v.toFixed(1)} />
      <Slider label="Focus Distance" value={ferrofluidConfig.focusDistance} min={1.0} max={10.0} step={0.1}
        onChange={(v) => setFerrofluidConfig({ focusDistance: v })} format={(v) => v.toFixed(1)} />

      {/* Audio Sensitivity */}
      <div className="border-t border-[var(--foreground)]/20 pt-2 mt-1">
        <span className="text-[9px] uppercase tracking-wider opacity-60 block mb-2">Audio Sensitivity</span>
        <div className="flex flex-col gap-2">
          <Slider label="Energy Floor" value={ferrofluidConfig.energyFloor} min={0.0} max={1.0} step={0.01}
            onChange={(v) => setFerrofluidConfig({ energyFloor: v })} format={(v) => v.toFixed(2)} />
          <Slider label="Bass Punch" value={ferrofluidConfig.bassPunch} min={0.0} max={0.5} step={0.01}
            onChange={(v) => setFerrofluidConfig({ bassPunch: v })} format={(v) => v.toFixed(2)} />
          <Slider label="Mids Detail" value={ferrofluidConfig.midsDetail} min={0.0} max={1.0} step={0.01}
            onChange={(v) => setFerrofluidConfig({ midsDetail: v })} format={(v) => v.toFixed(2)} />
          <Slider label="Highs Shimmer" value={ferrofluidConfig.highsShimmer} min={0.0} max={0.1} step={0.001}
            onChange={(v) => setFerrofluidConfig({ highsShimmer: v })} format={(v) => v.toFixed(3)} />
          <Slider label="Transient Crack" value={ferrofluidConfig.transientCrack} min={0.0} max={0.1} step={0.001}
            onChange={(v) => setFerrofluidConfig({ transientCrack: v })} format={(v) => v.toFixed(3)} />
          <Slider label="Fresnel Boost" value={ferrofluidConfig.fresnelBoost} min={0.0} max={3.0} step={0.1}
            onChange={(v) => setFerrofluidConfig({ fresnelBoost: v })} format={(v) => v.toFixed(1)} />
        </div>
      </div>

      <div className="flex flex-col gap-1 text-[10px] uppercase pt-1">
        <label>Blend Mode</label>
        <select
          value={ferrofluidConfig.blendMode}
          onChange={(e) => setFerrofluidConfig({ blendMode: e.target.value })}
          className="bg-[var(--background)] text-[var(--foreground)] border border-[var(--foreground)]/30 p-1 outline-none"
        >
          {['normal', 'multiply', 'screen', 'overlay', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </Section>
  );
}
