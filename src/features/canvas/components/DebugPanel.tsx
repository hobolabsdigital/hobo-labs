"use client";

import { useState } from 'react';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { INTRO_REVEAL_CLASSES } from '@/features/canvas/constants';
import { useTheme, type AppTheme } from '@/core/theme/theme-provider';
import { useCrtStore, DEFAULT_CRT_CONFIG } from '@/features/crt/store/useCrtStore';

const THEME_OPTIONS: { value: AppTheme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'blueprint', label: 'Blueprint // Real' },
  { value: 'cyberpunk', label: 'Cyber // Punk' },
  { value: 'brutalist', label: 'Brut // Al' },
  { value: 'retro', label: 'Retro // 70s' },
];

/** Collapsible section wrapper */
function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--foreground)]/30 pb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-xs uppercase tracking-wider font-bold py-1 cursor-pointer hover:opacity-70 transition-opacity"
      >
        <span>{title}</span>
        <span className="text-[10px] opacity-50">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && <div className="flex flex-col gap-2 mt-2">{children}</div>}
    </div>
  );
}

/** Reusable slider */
function Slider({
  label, value, min, max, step, onChange, format,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px]">
        <label>{label}</label>
        <span>{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--foreground)]"
      />
    </div>
  );
}

export function DebugPanel() {
  const isDebugDrawerOpen = useCanvasStore(state => state.isDebugDrawerOpen);
  const setDebugDrawerOpen = useCanvasStore(state => state.setDebugDrawerOpen);
  const nodes = useCanvasStore(state => state.nodes);
  const edges = useCanvasStore(state => state.edges);
  
  const physicsConfig = useCanvasStore(state => state.physicsConfig);
  const setPhysicsConfig = useCanvasStore(state => state.setPhysicsConfig);
  const fluidConfig = useCanvasStore(state => state.fluidConfig);
  const setFluidConfig = useCanvasStore(state => state.setFluidConfig);

  const isIntroAnimationFinished = useCanvasStore(state => state.isIntroAnimationFinished);

  const { theme, setTheme } = useTheme();

  // CRT store
  const crtConfig = useCrtStore((s) => s.crtConfig);
  const setCrtConfig = useCrtStore((s) => s.setCrtConfig);
  const crtMode = useCrtStore((s) => s.crtMode);
  const setCrtMode = useCrtStore((s) => s.setCrtMode);
  const experimentalSupported = useCrtStore((s) => s.experimentalSupported);

  return (
    <div className={`fixed top-4 right-0 z-50 ${INTRO_REVEAL_CLASSES} ${
      !isIntroAnimationFinished ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
    } ${isDebugDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <button 
        onClick={() => setDebugDrawerOpen(!isDebugDrawerOpen)}
        className={`bg-[var(--foreground)] text-[var(--background)] px-3 py-1 text-xs font-ui absolute right-[100%] top-0 hover:bg-opacity-80 transition-all duration-300 whitespace-nowrap mr-4`}
      >
        [ PLAYGROUND ]
      </button>

      <div className="bg-[var(--background)] border border-[var(--foreground)] border-r-0 p-4 shadow-2xl flex flex-col gap-3 font-ui w-80 h-auto max-h-[90vh] overflow-y-auto">

        {/* Theme — always open */}
        <Section title="Theme" defaultOpen>
          <div className="grid grid-cols-2 gap-1">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`px-2 py-1.5 text-[10px] uppercase tracking-wider border transition-colors ${
                  theme === opt.value
                    ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                    : 'bg-transparent text-[var(--foreground)] border-[var(--foreground)]/30 hover:border-[var(--foreground)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Section>

        {/* CRT Effect */}
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
          
          {/* Chromatic Aberration */}
          <Slider label="Aberration" value={crtConfig.aberrationOffset} min={0} max={5} step={0.1}
            onChange={(v) => setCrtConfig({ aberrationOffset: v })} format={(v) => v.toFixed(1) + "px"} />

          {/* Vignette */}
          <Slider label="Vignette Strength" value={crtConfig.vignetteStrength} min={0} max={1} step={0.01}
            onChange={(v) => setCrtConfig({ vignetteStrength: v })} format={(v) => v.toFixed(2)} />
          <Slider label="Vignette Radius" value={crtConfig.vignetteRadius} min={0.1} max={1.5} step={0.05}
            onChange={(v) => setCrtConfig({ vignetteRadius: v })} format={(v) => v.toFixed(2)} />

          {/* Film Grain */}
          <Slider label="Grain Opacity" value={crtConfig.grainOpacity} min={0} max={0.3} step={0.005}
            onChange={(v) => setCrtConfig({ grainOpacity: v })} format={(v) => v.toFixed(3)} />
          <Slider label="Grain Speed" value={crtConfig.grainSpeed} min={0.1} max={5} step={0.1}
            onChange={(v) => setCrtConfig({ grainSpeed: v })} format={(v) => v.toFixed(1) + "x"} />

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

        {/* Node Physics */}
        <Section title="Node Physics">
          <Slider label="Friction (Velocity Decay)" value={physicsConfig.velocityDecay} min={0} max={1} step={0.05}
            onChange={(v) => setPhysicsConfig({ velocityDecay: v })} format={(v) => v.toFixed(2)} />
          <Slider label="Gravity (Charge Strength)" value={physicsConfig.chargeStrength} min={-2000} max={100} step={50}
            onChange={(v) => setPhysicsConfig({ chargeStrength: v })} format={(v) => String(v)} />
          <Slider label="Link Distance" value={physicsConfig.linkDistance} min={10} max={500} step={10}
            onChange={(v) => setPhysicsConfig({ linkDistance: v })} format={(v) => String(v)} />
          <Slider label="Link Strength" value={physicsConfig.linkStrength} min={0} max={5} step={0.1}
            onChange={(v) => setPhysicsConfig({ linkStrength: v })} format={(v) => v.toFixed(1)} />
          <Slider label="Link Rigidity (Iterations)" value={physicsConfig.linkIterations} min={1} max={30} step={1}
            onChange={(v) => setPhysicsConfig({ linkIterations: v })} format={(v) => String(v)} />
        </Section>

        {/* Fluid Physics */}
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

        {/* Stats */}
        <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-1">
          <div>Nodes: {nodes.length}</div>
          <div>Edges: {edges.length}</div>
        </div>
      </div>
    </div>
  );
}
