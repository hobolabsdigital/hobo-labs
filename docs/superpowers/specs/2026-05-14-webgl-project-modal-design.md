# WebGL Project Modal — Design Spec

> **Date**: 2026-05-14
> **Status**: Approved
> **Reference**: [Tympanus WebGL Distortion Configurator](https://tympanus.net/Development/WebGLDistortionConfigurator/index.html?default=true)

## Summary

When a user clicks a compact ProjectNode card on the editorial canvas, a WebGL distortion transition animates the card from its canvas position to fullscreen, revealing the complete editorial project spread. The effect resembles a sheet of paper folding/unfolding off the canvas — vertex displacement via simplex noise on a subdivided Three.js plane, driven by a GSAP-animated progress uniform.

## Goals

1. Provide a dramatic, high-fidelity transition between the compact card and the full project view
2. Keep the modal fully decoupled from the ReactFlow canvas (viewport-level overlay)
3. Support reverse animation on close (fold back to card position)
4. Use existing project dependencies: Three.js, GSAP, html-to-image

## Non-Goals

- No changes to the D3 physics engine or canvas store
- No server-side changes
- No new npm dependencies

---

## Architecture

### New Feature Module

```
src/features/project-modal/
├── store/useProjectModalStore.ts    # Modal state + cardRect
├── components/
│   ├── ProjectModalOverlay.tsx      # Overlay container (Three.js canvas + DOM)
│   ├── ProjectExpandedView.tsx      # Full editorial spread (from git cdba28d)
│   └── DistortionPlane.tsx          # Three.js plane with custom shader
└── lib/
    ├── distortion-shader.ts         # GLSL vertex + fragment shaders
    └── capture.ts                   # html-to-image card capture utility
```

### Store: `useProjectModalStore`

```typescript
interface ProjectModalState {
  isOpen: boolean;
  animationPhase: 'idle' | 'opening' | 'open' | 'closing';
  projectData: ProjectCardData | null;
  cardRect: DOMRect | null;
  open: (data: ProjectCardData, rect: DOMRect) => void;
  close: () => void;
  setAnimationPhase: (phase: ProjectModalState['animationPhase']) => void;
}
```

- `open()` sets `projectData`, `cardRect`, and `animationPhase = 'opening'`
- `close()` sets `animationPhase = 'closing'`
- When closing animation finishes, the overlay calls `setAnimationPhase('idle')` which resets `isOpen = false`

### Component: `ProjectModalOverlay`

- Mounts at viewport level in `page.tsx` (inside `ReactFlowProvider`, outside `EditorialCanvas`)
- Fixed position, `z-[200]` (above all canvas layers)
- Contains:
  - A `<Canvas>` (react-three-fiber) for the distortion plane
  - The `<ProjectExpandedView>` DOM content behind/below the WebGL canvas
  - A dark backdrop overlay
  - An X close button
- Only renders when `isOpen === true`

### Component: `DistortionPlane`

A react-three-fiber component that:

1. Receives the card screenshot as a texture
2. Creates a `PlaneGeometry(1, 1, 32, 32)` — 32×32 subdivisions for smooth distortion
3. Uses a custom `ShaderMaterial` with:
   - `uProgress` uniform (0→1 for open, 1→0 for close)
   - `uTexture` uniform (card screenshot)
   - `uResolution` uniform (viewport dimensions)
   - `uCardRect` uniform (vec4: x, y, width, height in NDC)
4. Vertex shader: displaces vertices along Z axis using 3D simplex noise, modulated by `uProgress`. The plane morphs from `cardRect` position/size to fullscreen as progress advances.
5. Fragment shader: samples the texture with slight chromatic aberration during mid-transition (`uProgress` between 0.2 and 0.8)

### Component: `ProjectExpandedView`

Extracted from the previous ProjectNode implementation (git commit `cdba28d`). Contains:

- Header block: title (monospace label), year, role
- Hero image: full-width aspect-video
- Metadata table: title/year/role rows with borders
- Article content: paragraphs with light leading
- Tech stack: pill badges (mono, uppercase, bordered)
- Gallery grid: 2-column, aspect-4/3 images
- Problem/Solution: border-left blocks
- Hero quote: large italic pullout with border-top

Wrapped in a scrollable container with padding. No typewriter animations in the modal version — content renders immediately since the dramatic moment is the WebGL transition itself.

### Card Capture: `capture.ts`

Uses `html-to-image` (already in `package.json`) to capture the compact ProjectNode DOM element as a data URL. This becomes the texture for the distortion plane.

```typescript
import { toPng } from 'html-to-image';

export async function captureCardImage(element: HTMLElement): Promise<string> {
  return toPng(element, {
    pixelRatio: 2, // Retina quality
    backgroundColor: 'transparent',
  });
}
```

---

## Transition Flow

### Opening

```
1. User clicks compact ProjectNode card
2. onClick captures:
   - getBoundingClientRect() of the card DOM element
   - The project data from node props
3. store.open(data, rect) → isOpen=true, animationPhase='opening'
4. ProjectModalOverlay mounts:
   a. Dark backdrop fades in (opacity 0→0.8, 300ms)
   b. html-to-image captures the card → creates Three.js texture
   c. DistortionPlane renders at cardRect position
5. GSAP timeline plays (duration: ~1.2s, ease: power3.inOut):
   a. uProgress: 0 → 1
   b. Plane scales from cardRect to viewport
   c. Vertices displace via simplex noise (peak at progress ~0.5)
   d. At progress ~0.8: ProjectExpandedView starts fading in (opacity 0→1)
6. Timeline completes:
   a. animationPhase = 'open'
   b. Three.js canvas fades out (no longer needed)
   c. User interacts with the full DOM expanded view
```

### Closing

```
1. User presses Escape / clicks backdrop / clicks X button
2. store.close() → animationPhase='closing'
3. ProjectExpandedView fades out (opacity 1→0, 200ms)
4. Three.js canvas fades back in, DistortionPlane at fullscreen
5. GSAP timeline plays reverse (duration: ~0.8s, ease: power3.inOut):
   a. uProgress: 1 → 0
   b. Plane shrinks from viewport back to cardRect
   c. Simplex noise displacement plays in reverse
6. Timeline completes:
   a. animationPhase = 'idle'
   b. isOpen = false
   c. Overlay unmounts
```

---

## Integration Points

### `ProjectNode.tsx` (modify)

Add an `onClick` handler to the compact card:

```tsx
const handleExpand = (e: React.MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  useProjectModalStore.getState().open(data, rect);
};
```

Remove the `[ CLICK TO EXPAND ]` hover hint and replace with actual click behavior.

### `page.tsx` (modify)

Mount the overlay at the top level:

```tsx
<ReactFlowProvider>
  {/* ... existing content ... */}
  <ProjectModalOverlay />
</ReactFlowProvider>
```

---

## Shader Details

### Vertex Shader (simplified)

```glsl
uniform float uProgress;
uniform vec4 uCardRect; // x, y, w, h in NDC (-1 to 1)

// Simplex noise function (imported)
#pragma glslify: snoise3 = require('glsl-noise/simplex/3d')

void main() {
  // Interpolate position from card rect to fullscreen
  vec3 pos = position;
  
  // Card space: scale and translate to card rect
  vec3 cardPos = vec3(
    pos.x * uCardRect.z + uCardRect.x,
    pos.y * uCardRect.w + uCardRect.y,
    0.0
  );
  
  // Fullscreen space: the plane fills the viewport
  vec3 fullPos = pos;
  
  // Blend between card and fullscreen
  vec3 blended = mix(cardPos, fullPos, uProgress);
  
  // Displacement: simplex noise along Z, peaks at mid-transition
  float noiseAmt = sin(uProgress * 3.14159) * 0.3;
  float noise = snoise3(vec3(pos.xy * 3.0, uProgress * 2.0));
  blended.z += noise * noiseAmt;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(blended, 1.0);
}
```

### Fragment Shader

```glsl
uniform sampler2D uTexture;
uniform float uProgress;
varying vec2 vUv;

void main() {
  // Chromatic aberration during transition
  float aberration = sin(uProgress * 3.14159) * 0.005;
  float r = texture2D(uTexture, vUv + vec2(aberration, 0.0)).r;
  float g = texture2D(uTexture, vUv).g;
  float b = texture2D(uTexture, vUv - vec2(aberration, 0.0)).b;
  float a = texture2D(uTexture, vUv).a;
  
  gl_FragColor = vec4(r, g, b, a);
}
```

---

## Dismiss Behavior

All three triggers call the same `store.close()`:

| Trigger | Implementation |
|---|---|
| Escape key | `useEffect` with `keydown` listener on `document` |
| Backdrop click | `onClick` on the dark overlay div (not the content) |
| X button | Top-right corner, `font-mono text-[10px] uppercase tracking-widest`, brutalist style: `[ ✕ CLOSE ]` |

---

## Edge Cases

- **Card not visible**: If the compact card has scrolled off-screen or is behind other nodes, the `cardRect` may be stale. Fallback: animate from center of viewport instead.
- **Multiple rapid clicks**: Guard with `animationPhase !== 'idle'` check — ignore clicks during transition.
- **Image loading**: The card screenshot capture is async (~50-100ms). Show nothing until the texture is ready, then start the animation. The dark backdrop provides visual feedback immediately.
- **Mobile/tablet**: The expanded view should be scrollable within the modal. The WebGL transition still plays but with reduced subdivision count (16×16 instead of 32×32) for performance.

---

## Success Criteria

1. Clicking a compact project card triggers a smooth ~1.2s distortion-fold transition to fullscreen
2. The full editorial spread is readable and scrollable in the modal
3. Escape, backdrop click, and X button all trigger the reverse ~0.8s fold-back transition
4. No interference with the ReactFlow canvas or D3 physics
5. Transition runs at 60fps on modern hardware
