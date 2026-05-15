# Project Modal — Design Spec

> **Date**: 2026-05-14
> **Status**: Implemented
> **Reference**: Framer Motion layoutId transitions

## Summary

When a user clicks a compact ProjectNode card on the editorial canvas, a high-fidelity Framer Motion `layoutId` transition animates the hero image from its canvas position to fullscreen, revealing the complete editorial project spread. To support an interactive gallery slider without disrupting the flight path, a "sleight of hand" architecture is used: the flying image is seamlessly swapped for a native draggable carousel the moment the transition settles.

## Goals

1. Provide a dramatic, seamless transition between the compact card and the full project view using pure DOM/Framer Motion.
2. Keep the modal fully decoupled from the ReactFlow canvas (viewport-level overlay).
3. Support reverse animation on close (fly back to card position).
4. Implement a native, draggable image gallery without causing aspect-ratio squishing during the transition.

## Non-Goals

- No WebGL or Three.js shaders (scrapped for simplicity and performance).
- No changes to the D3 physics engine or canvas store.
- No server-side changes.

---

## Architecture

### Feature Module

```
src/features/project-modal/
├── store/useProjectModalStore.ts    # Modal state
└── components/
    ├── ProjectModalOverlay.tsx      # Overlay container and Framer Motion orchestration
    └── ProjectExpandedView.tsx      # Full editorial spread (text/metadata content)
```

### Store: `useProjectModalStore`

```typescript
interface ProjectModalState {
  isOpen: boolean;
  projectData: ProjectCardData | null;
  open: (data: ProjectCardData) => void;
  close: () => void;
}
```

- `open()` sets `projectData` and `isOpen = true`.
- `close()` sets `isOpen = false`.

### Component: `ProjectModalOverlay`

- Mounts at viewport level in `page.tsx` (inside `ReactFlowProvider`, outside `EditorialCanvas`).
- Fixed position, `z-[200]` (above all canvas layers).
- Contains:
  - A dark backdrop overlay that fades in.
  - The `layoutId` orchestrations for the hero image.
  - The interactive gallery slider (mounted after settlement).
  - The `<ProjectExpandedView>` DOM content below the image.
  - A brutalist `[ ✕ CLOSE ]` button.

### Sleight of Hand Gallery Architecture

To prevent vertical aspect-ratio squishing during the flight, the hero image and the interactive slider are completely decoupled:

1. **The Flight:** A pure `<motion.img layoutId="project-hero-{id}" />` with no wrappers flies across the screen. It is mathematically pristine and respects aspect ratios perfectly.
2. **The Swap:** 800ms after the modal opens (tracked via an `isSettled` state), the flight image is instantly rendered invisible (`opacity: 0`).
3. **The Slider:** In the exact same render frame, a `<motion.div drag="x">` gallery slider mounts in its place. The first slide is identical to the hero image, making the swap imperceptible to the user. The slider supports native drag, hover states, and dot navigation.
4. **The Return:** When closing, `isSettled` instantly becomes false, the slider unmounts, and the original `layoutId` image reappears to fly smoothly back to its card node.

---

## Transition Flow

### Opening

1. User clicks compact ProjectNode card.
2. `store.open(data)` → `isOpen=true`.
3. `ProjectModalOverlay` mounts:
   - Dark backdrop fades in.
   - `motion.img layoutId` flies from card position to modal header position.
   - Rest of DOM content staggers in.
4. After 800ms timer fires:
   - `isSettled` becomes true.
   - Flying image becomes invisible.
   - Native gallery slider mounts and takes over.

### Closing

1. User presses Escape or clicks X button.
2. `store.close()` → `isOpen=false`.
3. `isSettled` immediately resets to false.
4. Gallery slider unmounts.
5. Flying image reappears and flies back to the canvas node position.
6. Overlay unmounts.

---

## Edge Cases

- **Flexbox Squishing**: The gallery container uses `shrink-0` to guarantee that responsive flexbox layouts on shorter laptop screens do not vertically squish the `aspect-video` container.
- **Duplicate Images**: The `heroSrc` is aggressively deduplicated against the `gallery` array using a case-insensitive check to ensure the slider doesn't contain redundant slides.

## Success Criteria

1. Clicking a compact project card triggers a smooth, zero-squish flight to fullscreen.
2. The full editorial spread is readable and scrollable.
3. The gallery slider supports native horizontal dragging and dot navigation.
4. Escape and X button trigger the reverse flight back to the canvas.
5. High performance (60fps) DOM-only transitions.
