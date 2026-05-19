# Refactor Large Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the largest components (`ProjectModalOverlay.tsx`, `DebugPanel.tsx`, and `ferrofluid-system.ts`) to adhere to SOLID principles, DRY, and keep file lengths around 250 lines max.

**Architecture:** We will break down `ProjectModalOverlay` into smaller presentational components (`GallerySlider`, `ProjectDetails`) and extract its animation configs. We will modularize `DebugPanel` into feature-specific control panels. Finally, we will extract audio logic from the `Ferrofluid` core system.

**Tech Stack:** React, Framer Motion, Zustand, TypeScript

---

### Task 1: Refactor ProjectModalOverlay Animation Utilities

**Files:**
- Create: `src/features/project-modal/utils/motion-variants.ts`
- Modify: `src/features/project-modal/components/ProjectModalOverlay.tsx`

- [x] **Step 1: Extract motion variants into utility file**

```typescript
// src/features/project-modal/utils/motion-variants.ts
import { type Variants } from 'framer-motion';
import { getMotion } from '@/core/theme/theme-motion';

export const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
};

export function buildItemVariants(theme: string): Variants {
  const m = getMotion(theme).modal;
  if (m.type === 'tween') {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: m.enterDuration, ease: [0.16, 1, 0.3, 1] } },
      exit: { opacity: 0, transition: { duration: m.exitDuration } },
    };
  }
  return {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: m.stiffness, damping: m.damping } },
    exit: { opacity: 0, y: m.exitY, transition: { duration: m.exitDuration } },
  };
}
```

- [x] **Step 2: Update ProjectModalOverlay to import variants**
Remove the `stagger` and `buildItemVariants` definitions from `ProjectModalOverlay.tsx` and import them from the new utility file instead.

- [x] **Step 3: Commit**

```bash
git add src/features/project-modal/utils/motion-variants.ts src/features/project-modal/components/ProjectModalOverlay.tsx
git commit -m "refactor: extract motion variants for project modal"
```

### Task 2: Refactor ProjectModalOverlay Project Details Component

**Files:**
- Create: `src/features/project-modal/components/ProjectDetails.tsx`
- Modify: `src/features/project-modal/components/ProjectModalOverlay.tsx`

- [x] **Step 1: Create ProjectDetails component**
Extract the rendering logic for the Problem, Solution, Pull Quote, and Tech Stack into this new file.

- [x] **Step 2: Update ProjectModalOverlay**
Replace the inline Problem, Solution, Quote, and Tech Stack logic with the `<ProjectDetails />` component.

- [x] **Step 3: Commit**

```bash
git add src/features/project-modal/components/ProjectDetails.tsx src/features/project-modal/components/ProjectModalOverlay.tsx
git commit -m "refactor: extract ProjectDetails from ProjectModalOverlay"
```

### Task 3: Refactor ProjectModalOverlay Gallery Slider

**Files:**
- Create: `src/features/project-modal/components/GallerySlider.tsx`
- Modify: `src/features/project-modal/components/ProjectModalOverlay.tsx`

- [x] **Step 1: Create GallerySlider component**
Extract the `isSettled` dependent `<motion.div>` that maps over the gallery array and the dot navigation into this new file. Pass `currentIndex`, `setCurrentIndex`, `gallery`, `finalHeroSrc`, `imagesCount`, and the `m` (motion config) as props.

- [x] **Step 2: Update ProjectModalOverlay**
Replace the inline gallery slider code with the `<GallerySlider />` component.

- [x] **Step 3: Commit**

```bash
git add src/features/project-modal/components/GallerySlider.tsx src/features/project-modal/components/ProjectModalOverlay.tsx
git commit -m "refactor: extract GallerySlider from ProjectModalOverlay"
```

### Task 4: Extract DebugPanel Shared Components

**Files:**
- Create: `src/features/canvas/components/debug/Section.tsx`
- Create: `src/features/canvas/components/debug/Slider.tsx`
- Modify: `src/features/canvas/components/DebugPanel.tsx`

- [x] **Step 1: Move Section and Slider to individual files**
Copy the `Section` and `Slider` components from the top of `DebugPanel.tsx` into their own files.

- [x] **Step 2: Import them into DebugPanel**
Remove the inline definitions and import them.

- [x] **Step 3: Commit**

```bash
git add src/features/canvas/components/debug/Section.tsx src/features/canvas/components/debug/Slider.tsx src/features/canvas/components/DebugPanel.tsx
git commit -m "refactor: extract Section and Slider components for DebugPanel"
```

### Task 5: Modularize DebugPanel Controls

**Files:**
- Create: `src/features/canvas/components/debug/CrtDebugControls.tsx`
- Create: `src/features/canvas/components/debug/FluidDebugControls.tsx`
- Create: `src/features/canvas/components/debug/FerrofluidDebugControls.tsx`
- Modify: `src/features/canvas/components/DebugPanel.tsx`

- [x] **Step 1: Create CrtDebugControls**
Extract the CRT section logic (and `useCrtStore` hooks) into `CrtDebugControls.tsx`.

- [x] **Step 2: Create FluidDebugControls**
Extract the Fluid section logic (and `fluidConfig` hooks) into `FluidDebugControls.tsx`.

- [x] **Step 3: Create FerrofluidDebugControls**
Extract the Ferrofluid section logic (and `ferrofluidConfig` hooks) into `FerrofluidDebugControls.tsx`.

- [x] **Step 4: Clean up DebugPanel**
Replace all the inline code with the three new control components. Remove unused imports in `DebugPanel.tsx`.

- [x] **Step 5: Commit**

```bash
git add src/features/canvas/components/debug/ src/features/canvas/components/DebugPanel.tsx
git commit -m "refactor: split DebugPanel into feature-specific control components"
```
