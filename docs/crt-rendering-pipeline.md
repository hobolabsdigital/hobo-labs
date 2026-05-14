# CRT Rendering Pipeline

> GPU-accelerated CRT barrel distortion using Chrome's experimental `drawElementImage` API.

## Overview

The portfolio ships with two CRT rendering modes. The user selects one via a modal on first load — **nothing renders until a mode is chosen**, preventing race conditions with GSAP intro animations.

| Mode | Engine | How it works |
|------|--------|-------------|
| **Standard** | CSS | SVG filter (`url(#crt-barrel)`) applied to `<main>` via inline `style.filter`. Lightweight, cross-browser. |
| **Experimental** | WebGL 2 | DOM → canvas rasterization → barrel distortion fragment shader. Chrome-only, requires flag. |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  page.tsx                                           │
│                                                     │
│  ┌─ CrtEffect ──────────────────────────────────┐   │
│  │  CrtModeSelector (modal)                     │   │
│  │  CrtControls (debug panel)                   │   │
│  │  ExperimentalBarrel (WebGL output canvas)     │   │
│  │  SVG barrel filter (standard mode)            │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ Content (gated on crtMode !== null) ─────────┐  │
│  │                                               │  │
│  │  isExperimental?                              │  │
│  │    ├─ YES: <canvas id="crt-capture"           │  │
│  │    │         layoutsubtree>                    │  │
│  │    │           <main>{pageContent}</main>      │  │
│  │    │        </canvas>                          │  │
│  │    └─ NO:  <main>{pageContent}</main>          │  │
│  │                                               │  │
│  │  Shared overlays (outside capture scope):     │  │
│  │    DebugPanel, TimelineScrubber,              │  │
│  │    FluidBackground, ThemeToggle               │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Experimental Mode — Render Loop

The experimental pipeline follows a **Capture → Upload → Shade** loop at 60fps:

```
┌──────────────┐    drawElementImage     ┌──────────────┐
│  <canvas     │ ─────────────────────►  │  Capture     │
│  layoutsub-  │    rasterize DOM        │  Canvas 2D   │
│  tree>       │    into pixel buffer    │  (hidden)    │
│  └─ <main>   │                         └──────┬───────┘
│     └─ DOM   │                                │
└──────────────┘                     texImage2D │
                                                ▼
                                    ┌──────────────────┐
                                    │  WebGL 2 Texture │
                                    └────────┬─────────┘
                                             │
                                    Fragment  │  Shader
                                             ▼
                                    ┌──────────────────┐
                                    │  Output Canvas   │
                                    │  (visible,       │
                                    │   barrel-warped) │
                                    └──────────────────┘
```

### Key steps in `ExperimentalBarrel.tsx`:

1. **Wait for paint** — Double `requestAnimationFrame` delay so Chrome has a cached paint record for the `layoutsubtree` content.
2. **Feature detect** — Check `ctx.drawElementImage` exists; fall back to standard mode if not.
3. **Capture** — `ctx.drawElementImage(mainEl, 0, 0, w, h)` rasterizes the `<main>` DOM subtree.
4. **Upload** — `gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, captureCanvas)`.
5. **Clear** — `ctx.clearRect(0, 0, w, h)` immediately after upload to prevent ghosting (the capture canvas bitmap would otherwise show through behind the WebGL canvas).
6. **Shade** — Fragment shader applies barrel distortion, chromatic aberration, vignette, CRT bezel, top darkening, and film grain.
7. **Display** — Output canvas flips from `display: none` to `display: block` on first successful frame.

---

## Fragment Shader Effects

All parameters are exposed as uniforms and adjustable in real-time via the CRT debug panel.

### Barrel Distortion
```glsl
vec2 barrelDistortion(vec2 uv, float k) {
  vec2 p = uv * 2.0 - 1.0;
  float r2 = dot(p, p);
  p *= 1.0 + k * r2;
  return p * 0.5 + 0.5;
}
```
Radial distortion applied per-channel for chromatic aberration (R, G, B each get slightly different `k` values).

### CRT Bezel (Rounded Border)
SDF-based rounded rectangle that **insets** the visible area, creating a black frame:
```glsl
float inset = uCornerRadius * 0.5;
vec2 screenSize = vec2(aspect - inset, 1.0 - inset);
float cornerRound = uCornerRadius * 0.8;
float dist = roundedRectSDF(scaled, screenSize, cornerRound);
float mask = 1.0 - smoothstep(0.0, uEdgeSoftness + 0.005, dist);
```
- `cornerRadius = 0` → no frame
- `cornerRadius = 0.5` → thick bezel, very rounded corners
- `edgeSoftness` → gradient width at the bezel edge

### Vignette
Classic screen-edge darkening:
```glsl
vec2 vig = vUv * (1.0 - vUv);
float vigFactor = pow(vig.x * vig.y * 15.0, uVignetteRadius * 1.5);
outColor.rgb *= mix(1.0, vigFactor, uVignetteStrength);
```

### Top Gradient
Darkens the upper portion of the screen for logo visibility:
```glsl
float topDarken = smoothstep(0.0, 0.45, 1.0 - vUv.y);
outColor.rgb *= mix(1.0, topDarken, uTopDarken);
```

### Film Grain
Animated noise overlay:
```glsl
outColor.rgb += (rand(vec3(p * uResolution.xy * 0.5, uTime)) - 0.5) * uGrainOpacity * 2.0;
```

---

## Configuration (`useCrtStore`)

Zustand store holding all CRT state. Config values are read directly in the render loop each frame (no React re-renders needed).

### Default Values

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| `barrelStrength` | 10 | 0–100 | CRT curvature intensity |
| `aberrationOffset` | 1.8 | 0–5 | RGB channel split (px) |
| `vignetteStrength` | 0.36 | 0–1 | Edge darkening intensity |
| `vignetteRadius` | 0.75 | 0.1–1.5 | Vignette falloff distance |
| `grainOpacity` | 0.115 | 0–0.3 | Film noise intensity |
| `grainSpeed` | 1.5 | 0.1–5 | Grain animation speed |
| `cornerRadius` | 0.18 | 0–0.5 | Bezel corner rounding (experimental only) |
| `edgeSoftness` | 0.12 | 0–0.3 | Bezel edge gradient (experimental only) |
| `topDarken` | 0.65 | 0–1 | Top area darkening (experimental only) |

### Feature Detection

```ts
export function detectDrawElementImage(): boolean {
  const tc = document.createElement("canvas");
  tc.setAttribute("layoutsubtree", "");
  const ctx = tc.getContext("2d");
  return ctx !== null && typeof (ctx as any).drawElementImage === "function";
}
```
Canvas is never appended to the DOM — it's a disposable probe.

---

## Z-Index Stacking

| Layer | z-index | Element | Notes |
|-------|---------|---------|-------|
| Background | 0 | `FluidBackground` (WebGL) | Independent, not captured |
| Content | auto | Capture canvas / `<main>` | DOM content |
| Barrel output | 0 | WebGL output canvas | `pointer-events: none` |
| Overlays | 9998 | DebugPanel, TimelineScrubber, ThemeToggle | `pointer-events: auto` on children |
| Chat input | 100 | ChatInput | Inside capture canvas (gets barrel-warped) |

---

## Startup Sequencing

```
Page load
  └─ CrtModeSelector renders (modal)
  └─ No content mounted (crtMode === null)
  └─ User clicks "Standard" or "Experimental"
       └─ setCrtMode(mode)
       └─ crtMode !== null → content mounts
       └─ IntroNode + GSAP animations begin
       └─ ExperimentalBarrel.useEffect fires
            └─ 2× rAF delay
            └─ trySetup() polls for #crt-capture + #crt-main
            └─ render loop starts
```

---

## Prerequisites

| Requirement | Detail |
|------------|--------|
| **Browser** | Chrome only (experimental mode) |
| **Flag** | `chrome://flags/#canvas-draw-element` must be enabled |
| **API** | `CanvasRenderingContext2D.drawElementImage()` |
| **Attribute** | `<canvas layoutsubtree>` on the capture element |

---

## Known Issues & Gotchas

1. **CSS shadows get baked** — Any `box-shadow` on elements inside the capture canvas becomes permanent pixels in the rasterized texture. Remove shadows from captured content or move shadowed elements outside the capture scope.

2. **Black background flashes** — Can occur if `drawElementImage` captures during intro animations when the page is dark. Resolves once content finishes rendering.

3. **`layoutsubtree` must be set via JS** — React/TypeScript doesn't recognize the attribute. Set it via `useEffect` with `setAttribute("layoutsubtree", "true")` and clean up on unmount.

4. **Overlay components must be outside capture** — DebugPanel, TimelineScrubber, ThemeToggle are placed after the capture canvas in the component tree. If placed inside, they'd be barrel-warped and lose pointer interactivity.

5. **Canvas resize invalidates paint records** — Setting `.width` or `.height` on the capture canvas clears its content. The render loop handles this by re-capturing immediately after resize.

---

## File Map

```
src/features/crt/
├── components/
│   ├── CrtControls.tsx        # Debug sliders panel (left slide-out)
│   ├── CrtEffect.tsx          # Orchestrator: mounts selector, controls, barrel, SVG filter
│   ├── CrtModeSelector.tsx    # Initial mode selection modal
│   └── ExperimentalBarrel.tsx # WebGL render loop + fragment shader
└── store/
    └── useCrtStore.ts         # Zustand store: mode, config, feature detection
```
