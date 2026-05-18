# Ferrofluid WebGL Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a robust, non-blocking, transparent, and theme-aware 3D spherical ferrofluid background from scratch using `twgl.js`, decoupling it from the messy experimental code in `sketch-04`.

**Architecture:** Create a new `FerrofluidSystem` class (in `ferrofluid-system.ts`) focused purely on the spherical mesh, discarding the complex post-processing and offscreen rendering used in the old experiments if they aren't needed. The system will receive theme colors and normalized mouse coordinates from React, rendering directly to a transparent WebGL canvas. The shaders will be rewritten for clarity, ensuring proper world-space normal calculation and theme-aware fresnel/base coloring without arbitrary hardcoded values.

**Tech Stack:** React, WebGL2, `twgl.js`, `gl-matrix`

---

### Task 1: Clean Slate & Scaffolding

**Files:**
- Create: `apps/portfolio/src/features/ferrofluid/core/ferrofluid-system.ts`
- Create: `apps/portfolio/src/features/ferrofluid/shaders/sphere_vert.ts`
- Create: `apps/portfolio/src/features/ferrofluid/shaders/sphere_frag.ts`

- [ ] **Step 1: Write `sphere_vert.ts`**
  - Implement a clean vertex shader that takes position, normal, and texcoord.
  - Apply spherical displacement using simplex noise.
  - Calculate world-space normals correctly using the world matrix.
  - Pass the view vector `V` and normal `N` to the fragment shader.

- [ ] **Step 2: Write `sphere_frag.ts`**
  - Implement a clean fragment shader using `u_color1` and `u_color2`.
  - Calculate fresnel and specular highlights.
  - Ensure `outColor` uses full alpha (`1.0`) so the ferrofluid is opaque, while the background remains transparent.

- [ ] **Step 3: Create `ferrofluid-system.ts` class skeleton**
  - Setup WebGL2 context with `alpha: true, premultipliedAlpha: false`.
  - Initialize `twgl.createProgramInfo` using the new shaders.
  - Create a sphere buffer using `twgl.primitives.createSphereBufferInfo`.
  - Add `setTheme(theme: string)` to map 'cyberpunk', 'blueprint', etc. to hex/rgb values.
  - Add `setMouse(x: number, y: number)` to receive normalized coordinates.
  - Implement a `render(time)` loop.

- [x] **Step 4: Commit**

### Task 2: React Integration

**Files:**
- Modify: `apps/portfolio/src/features/ferrofluid/components/FerrofluidCanvas.tsx`

- [ ] **Step 1: Wire up the `FerrofluidSystem`**
  - Replace the old `Sketch` instantiation with `FerrofluidSystem`.
  - Pass the current `theme` to `FerrofluidSystem.setTheme()` via `useEffect`.
  - Pass the global `mousemove` normalized coordinates to `FerrofluidSystem.setMouse()`.

- [ ] **Step 2: Run and Test**
  - Navigate to `http://localhost:3000`.
  - Verify that the canvas renders a 3D sphere that reacts to mouse movement.
  - Verify that the background is transparent (the website UI underneath is visible).

- [ ] **Step 3: Commit**

### Task 3: Theme-Aware Aesthetics & Polish

**Files:**
- Modify: `apps/portfolio/src/features/ferrofluid/core/ferrofluid-system.ts`
- Modify: `apps/portfolio/src/features/ferrofluid/shaders/sphere_frag.ts`

- [x] **Step 1: Map exact design theme colors**
  - Update `setTheme` to precisely match the Brutalist, Cyberpunk, and Blueprint color palettes.
  - Ensure the shading math in `sphere_frag.ts` properly highlights the peaks and valleys without turning into a black blob.

- [x] **Step 2: Verify in Browser**
  - Switch themes in the app and verify the ferrofluid smoothly changes color or snaps to the correct new palette.
  - Check edge alpha or anti-aliasing if necessary.

- [x] **Step 3: Clean up legacy experimental files**
  - Delete `sketch-04.ts`, `spikes_frag.ts`, `spikes_vert.ts` and other unused experimental shaders to reduce technical debt.

- [x] **Step 4: Commit**
