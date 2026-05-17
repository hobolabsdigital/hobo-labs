/**
 * theme-canvas.ts — Centralized canvas rendering config per theme.
 *
 * The InteractiveGrid reads from `getCanvasConfig(theme)` instead of
 * checking `isBrutalist`/`isRetro`/`isBlueprint`/`isCyberpunk`.
 * 
 * `dotShape` drives the rendering algorithm:
 *   - 'line'              → iron-filing stretch near cursor (default)
 *   - 'round'             → soft circular dots
 *   - 'square'            → halftone squares, no mouse repel
 *   - 'crosshair'         → drafting cross marks
 *   - 'construction-lines' → full-width/height grid lines, no dots
 */

export type DotShape = 'line' | 'round' | 'square' | 'crosshair' | 'construction-lines';

export interface CanvasConfig {
  dotShape: DotShape;
  dotColor: string;
  repelRadius: number;
  repelStrength: number;
  /** 'none' | 'gradient' — whether to paint a full-screen gradient before dots */
  background: 'none' | 'gradient';
  /** Gradient stops (only used when background === 'gradient') */
  gradientStops?: Array<{ offset: number; color: string }>;
  /** Mouse-reactive glow (only used when background === 'gradient') */
  glowColor?: string;
  glowRadius?: number;
}

const defaultCanvas: CanvasConfig = {
  dotShape: 'line',
  dotColor: 'rgba(0, 0, 0, 0.35)',
  repelRadius: 150,
  repelStrength: 20,
  background: 'none',
};

const canvasMap: Record<string, Partial<CanvasConfig>> = {
  dark: {
    dotColor: 'rgba(255, 255, 255, 0.5)',
  },
  blueprint: {
    dotShape: 'crosshair',
    dotColor: 'rgba(42, 61, 181, 0.08)',
  },
  cyberpunk: {
    dotColor: 'rgba(255, 45, 123, 0.35)',
  },
  brutalist: {
    dotShape: 'construction-lines',
    dotColor: 'rgba(23, 223, 241, 0.12)',
    repelRadius: 0,
    repelStrength: 0,
  },
  retro: {
    dotShape: 'round',
    dotColor: 'rgba(212, 184, 150, 0.3)',
    repelRadius: 270,
    repelStrength: 8,
    background: 'gradient',
    gradientStops: [
      { offset: 0, color: '#FFB088' },    // warm peach (bottom)
      { offset: 0.3, color: '#FFC8A8' },  // soft coral
      { offset: 0.55, color: '#E8E0C8' }, // warm neutral bridge
      { offset: 0.8, color: '#B8E0E8' },  // pale aqua
      { offset: 1, color: '#A0D8E8' },    // baby blue (top)
    ],
    glowColor: 'rgba(255, 150, 120, 0.3)',
    glowRadius: 0.6,
  },
};

/**
 * Get the canvas config for a theme. Merges theme overrides with defaults.
 */
export function getCanvasConfig(theme: string): CanvasConfig {
  const overrides = canvasMap[theme];
  if (!overrides) return defaultCanvas;
  return { ...defaultCanvas, ...overrides };
}
