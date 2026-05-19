"use client";

import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { Section } from './Section';
import { Slider } from './Slider';

export function FluidDebugControls() {
  const fluidConfig = useCanvasStore(state => state.fluidConfig);
  const setFluidConfig = useCanvasStore(state => state.setFluidConfig);

  return (
    <Section title="Fluid Physics">
      <Slider label="Splat Radius" value={fluidConfig.SPLAT_RADIUS} min={0.01} max={1.0} step={0.01}
        onChange={(v) => setFluidConfig({ SPLAT_RADIUS: v })} format={(v) => v.toFixed(2)} />
      <Slider label="Density Dissipation" value={fluidConfig.DENSITY_DISSIPATION} min={0.1} max={5.0} step={0.1}
        onChange={(v) => setFluidConfig({ DENSITY_DISSIPATION: v })} format={(v) => v.toFixed(1)} />
      <Slider label="Velocity Dissipation" value={fluidConfig.VELOCITY_DISSIPATION} min={0.1} max={5.0} step={0.1}
        onChange={(v) => setFluidConfig({ VELOCITY_DISSIPATION: v })} format={(v) => v.toFixed(1)} />
      <Slider label="Pressure" value={fluidConfig.PRESSURE} min={0.0} max={1.0} step={0.01}
        onChange={(v) => setFluidConfig({ PRESSURE: v })} format={(v) => v.toFixed(2)} />
      <Slider label="Curl" value={fluidConfig.CURL} min={0} max={100} step={1}
        onChange={(v) => setFluidConfig({ CURL: v })} format={(v) => String(v)} />
      <Slider label="Aberration" value={fluidConfig.ABERRATION_MULT} min={0.0} max={10.0} step={0.001}
        onChange={(v) => setFluidConfig({ ABERRATION_MULT: v })} format={(v) => v.toFixed(3)} />

      <div className="flex items-center justify-between pt-1">
        <label htmlFor="color-cycle-mode" className="text-[10px] uppercase tracking-wider">Color Cycle</label>
        <input
          type="checkbox" id="color-cycle-mode"
          checked={fluidConfig.COLOR_CYCLE}
          onChange={(e) => setFluidConfig({ COLOR_CYCLE: e.target.checked })}
          className="w-3 h-3 accent-[var(--foreground)]"
        />
      </div>

      {!fluidConfig.COLOR_CYCLE && (
        <div className="flex items-center justify-between text-[10px]">
          <label>Splat Color</label>
          <input type="color" value={fluidConfig.SPLAT_COLOR}
            onChange={(e) => setFluidConfig({ SPLAT_COLOR: e.target.value })}
            className="h-6 w-8 p-0 border-0 cursor-pointer" />
        </div>
      )}

      {fluidConfig.COLOR_CYCLE && (
        <Slider label="Cycle Speed" value={fluidConfig.COLOR_CYCLE_SPEED} min={0.1} max={5.0} step={0.1}
          onChange={(v) => setFluidConfig({ COLOR_CYCLE_SPEED: v })} format={(v) => v.toFixed(1)} />
      )}
    </Section>
  );
}
