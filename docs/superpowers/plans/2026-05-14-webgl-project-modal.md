# Framer Motion Project Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a cinematic layoutId-driven modal transition that expands compact project cards into full-screen editorial spreads, incorporating a native drag gallery without layout aspect-ratio distortion.

**Architecture:** We introduce a decoupled `ProjectModalOverlay` mounted at the viewport level, managing its state via `useProjectModalStore`. The transition employs Framer Motion's `layoutId` to seamlessly fly the hero image from the canvas to the modal. To allow for an interactive carousel without breaking the flight mechanics, a "sleight of hand" architecture is used: the flying image is swapped for a fully interactive native slider exactly 800ms after the transition settles.

**Tech Stack:** React, Zustand, Framer Motion, TailwindCSS.

---

### Task 1: Store Configuration

**Files:**
- Create: `src/features/project-modal/store/useProjectModalStore.ts`

- [x] **Step 1: Implement the Zustand store**

```typescript
// src/features/project-modal/store/useProjectModalStore.ts
import { create } from 'zustand';

export interface ProjectModalState {
  isOpen: boolean;
  projectData: any | null;
  open: (data: any) => void;
  close: () => void;
}

export const useProjectModalStore = create<ProjectModalState>((set) => ({
  isOpen: false,
  projectData: null,
  open: (data) => set({ isOpen: true, projectData: data }),
  close: () => set({ isOpen: false }),
}));
```

---

### Task 2: Project Expanded View Content

**Files:**
- Create: `src/features/project-modal/components/ProjectExpandedView.tsx`

- [x] **Step 1: Implement the Expanded View DOM content blocks**

Extract metadata layout from the original canvas nodes into a pure DOM layout below the hero image wrapper, including:
- Problem/Solution grids.
- Italic pull quotes.
- Tech stack mapping.

---

### Task 3: Modal Overlay & Sleight of Hand Gallery

**Files:**
- Create: `src/features/project-modal/components/ProjectModalOverlay.tsx`

- [x] **Step 1: Implement the layoutId transition & slider**

```tsx
// src/features/project-modal/components/ProjectModalOverlay.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectModalStore } from '../store/useProjectModalStore';

// Note: Ensure `shrink-0` is applied to the aspect-video container 
// to prevent flexbox from squishing the container height on short viewports.
```

- Implement an 800ms `isSettled` timer tied to the `isOpen` state.
- Map the pristine `<motion.img layoutId="project-hero-id" />` directly below the aspect-video container.
- When `isSettled` is true, map the `<motion.div drag="x">` gallery array over the top and set the pristine image's `opacity` to 0.

---

### Task 4: App Integration

**Files:**
- Modify: `src/features/canvas/components/nodes/ProjectNode.tsx`
- Modify: `src/app/page.tsx`

- [x] **Step 1: Wire ProjectNode onClick**

Bind the click handler to update the Zustand store with `heroSrc`.

- [x] **Step 2: Mount Overlay in `page.tsx`**

Include `<ProjectModalOverlay />` inside the root provider context so it sits above the ReactFlow canvas layer (`z-[200]`).

---

## Verification Plan

### Automated Tests
- Run `npm run lint` and `npm run build` to verify type safety.

### Manual Verification
1. Open the dev server (`npm run dev`) and navigate to the editorial canvas.
2. Click a project node card.
3. Verify the hero image flies perfectly without aspect-ratio squishing.
4. Wait 800ms and verify the image responds to horizontal dragging (the native gallery).
5. Ensure the fallback `heroSrc` logic cleanly deduplicates against the `gallery` array.
6. Click the `[ ✕ CLOSE ]` button or press Escape.
7. Verify the flying image instantly reappears and flies perfectly back to the canvas node position.anvas.
