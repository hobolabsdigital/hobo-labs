'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { FREEZE_EVENT } from '../themes';
import { FilterRenderer, mixPalette, readPalette, type Palette } from './filter-renderer';

type Props = {
  /** Tall scroll track the hero is pinned inside; its progress grows the lens. */
  trackRef: RefObject<HTMLElement | null>;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const SCALES = [1, 0.75, 0.5];

/**
 * Full-bleed WebGL2 canvas. Writes --lens-x/--lens-y/--lens-r/--order onto its
 * parent so HTML overlays can track the lens, and fills any
 * [data-readout] nodes inside the parent with live numbers.
 */
export function FilterField({ trackRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    let renderer: FilterRenderer;
    try {
      renderer = new FilterRenderer(canvas);
    } catch {
      host.classList.add('gl-fallback');
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const readouts = {
      x: host.querySelector<HTMLElement>('[data-readout="x"]'),
      y: host.querySelector<HTMLElement>('[data-readout="y"]'),
      gen: host.querySelector<HTMLElement>('[data-readout="gen"]'),
      brand: host.querySelector<HTMLElement>('[data-readout="brand"]'),
    };
    const fmt = new Intl.NumberFormat('en-GB');

    let palette: Palette = readPalette();
    let paletteFrom = palette;
    let paletteTo = palette;
    let paletteT = 1;

    let scaleIdx = 0;
    let cssW = 0;
    let cssH = 0;
    const lens: [number, number] = [0, 0];
    let lensInit = false;
    let pointer: { x: number; y: number; at: number } | null = null;
    let visible = true;
    let frozen = false;
    let raf = 0;
    let frames = 0;
    let slowAccum = 0;
    let slowCount = 0;
    const start = performance.now();
    let last = start;

    const measure = () => {
      const r = canvas.getBoundingClientRect();
      cssW = r.width;
      cssH = r.height;
      renderer.resize(cssW, cssH, SCALES[scaleIdx]);
      return r;
    };
    measure();

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const elapsed = (now - start) / 1000;
      const rect = measure();

      // Scroll progress through the pinned track.
      let order = 0;
      const track = trackRef.current;
      if (track) {
        const tr = track.getBoundingClientRect();
        const span = tr.height - window.innerHeight;
        order = span > 0 ? clamp01(-tr.top / span) : 0;
      }

      // Lens target: the pointer when it's recent, otherwise a slow Lissajous drift.
      const t = reduced ? 8 : elapsed;
      const wander: [number, number] = [
        cssW * (0.48 + 0.14 * Math.sin(t * 0.23)),
        cssH * (0.34 + 0.08 * Math.sin(t * 0.31 + 1.3)),
      ];
      let target = wander;
      if (pointer) {
        const idle = (now - pointer.at) / 1000;
        const p: [number, number] = [pointer.x - rect.left, pointer.y - rect.top];
        const back = reduced ? 0 : clamp01((idle - 6) / 3);
        target = [p[0] + (wander[0] - p[0]) * back, p[1] + (wander[1] - p[1]) * back];
      }
      if (!lensInit) {
        lens[0] = wander[0];
        lens[1] = wander[1];
        lensInit = true;
      }
      const follow = 1 - Math.pow(reduced ? 0.0001 : 0.002, dt);
      lens[0] += (target[0] - lens[0]) * follow;
      lens[1] += (target[1] - lens[1]) * follow;

      const intro = reduced ? 1 : clamp01(elapsed / 1.8);
      const r0 = Math.min(230, Math.max(96, Math.min(cssW, cssH) * 0.21));
      const farthest = Math.hypot(Math.max(lens[0], cssW - lens[0]), Math.max(lens[1], cssH - lens[1])) + 24;
      const radius = r0 * (reduced ? 1 : easeOutBack(clamp01((elapsed - 0.5) / 1.1))) + (farthest - r0) * easeInOutCubic(order);

      if (paletteT < 1) {
        paletteT = clamp01(paletteT + dt / 0.45);
        palette = mixPalette(paletteFrom, paletteTo, easeOutCubic(paletteT));
      }

      renderer.render({ time: t * 0.35, intro: easeOutCubic(intro), lens, radius, palette });
      if (frames === 0) host.classList.add('gl-ready');

      host.style.setProperty('--lens-x', `${lens[0].toFixed(1)}px`);
      host.style.setProperty('--lens-y', `${lens[1].toFixed(1)}px`);
      host.style.setProperty('--lens-r', `${radius.toFixed(1)}px`);
      host.style.setProperty('--order', order.toFixed(3));

      if (frames % 5 === 0) {
        if (readouts.x) readouts.x.textContent = (lens[0] / Math.max(cssW, 1)).toFixed(3);
        if (readouts.y) readouts.y.textContent = (lens[1] / Math.max(cssH, 1)).toFixed(3);
        const gen = Math.round(1000 * easeOutCubic(clamp01(elapsed / 2.4)) + Math.max(0, elapsed - 2.4) * 17);
        if (readouts.gen) readouts.gen.textContent = fmt.format(gen);
        if (readouts.brand) readouts.brand.textContent = fmt.format(Math.floor(gen / 100));
      }
      frames++;

      // Adaptive resolution: step down once if the GPU can't keep ~40fps.
      if (frames > 20 && !reduced) {
        slowAccum += dt;
        slowCount++;
        if (slowCount === 60) {
          if (slowAccum / slowCount > 0.025 && scaleIdx < SCALES.length - 1) scaleIdx++;
          slowAccum = 0;
          slowCount = 0;
        }
      }

      const settling = paletteT < 1 || elapsed < 3;
      if (visible && !frozen && (!reduced || settling)) raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (!raf && visible && !frozen) raf = requestAnimationFrame(frame);
    };

    const onFreeze = (e: Event) => {
      frozen = (e as CustomEvent<boolean>).detail;
      if (frozen) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        last = performance.now();
        kick();
      }
    };

    const onPointer = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY, at: performance.now() };
      if (reduced) kick();
    };
    const onScrollOrResize = () => {
      if (reduced) kick();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        last = performance.now();
        kick();
      }
    });
    io.observe(canvas);

    const mo = new MutationObserver(() => {
      paletteFrom = palette;
      paletteTo = readPalette();
      paletteT = 0;
      if (frozen) {
        // Mid view-transition: jump straight to the new palette and draw once,
        // so the circle reveal uncovers the new colours.
        palette = paletteTo;
        paletteT = 1;
        if (visible) frame(performance.now());
      }
      kick();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    window.addEventListener(FREEZE_EVENT, onFreeze);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    kick();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      window.removeEventListener(FREEZE_EVENT, onFreeze);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      renderer.destroy();
      host.classList.remove('gl-ready');
    };
  }, [trackRef]);

  return <canvas ref={canvasRef} className="field-canvas" aria-hidden="true" />;
}
