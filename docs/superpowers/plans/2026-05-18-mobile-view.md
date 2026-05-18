# Mobile View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Unified Stream" mobile view by branching ReactFlow desktop logic and creating a responsive vertical feed.

**Architecture:** Use `useMediaQuery` to branch viewport rendering in `page.tsx`. Create a new `MobileStreamView` to map the shared Zustand state (`useCanvasStore`) into a vertical flex layout. Modify existing Nodes to be responsive. Fix modal transitions for mobile.

**Tech Stack:** Next.js App Router, Tailwind CSS, Zustand, Framer Motion

---

### Task 1: Create `useMediaQuery` hook

**Files:**
- Create: `src/core/hooks/useMediaQuery.ts`

- [ ] **Step 1: Write the hook implementation**

Create `src/core/hooks/useMediaQuery.ts` with standard SSR-friendly media query logic:

```typescript
"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/core/hooks/useMediaQuery.ts
git commit -m "feat: add useMediaQuery hook"
```

### Task 2: Update Node Components for Responsive Width

**Files:**
- Modify: `src/features/canvas/components/nodes/ProjectNode.tsx`
- Modify: `src/features/canvas/components/nodes/TextNode.tsx`
- Modify: `src/features/canvas/components/nodes/HeroNode.tsx`

- [ ] **Step 1: Make `ProjectNode` width responsive**

In `src/features/canvas/components/nodes/ProjectNode.tsx`, locate both `ProjectSkeleton` and `ProjectNode`. Replace the hardcoded `style={{ width: '800px' }}` with Tailwind classes.

Change in `ProjectSkeleton`:
```tsx
      className="relative bg-background origin-center flex flex-col shadow-2xl border border-foreground/10 w-full max-w-full md:max-w-none md:w-[800px]"
      // remove style={{ width: '800px' }}
```

Change in `ProjectNode` (the `motion.div`):
```tsx
        className="project-node-card relative bg-background origin-center flex flex-col shadow-2xl border border-foreground/10 group cursor-pointer hover:border-foreground/30 transition-all duration-300 w-full max-w-full md:max-w-none md:w-[800px]"
        // remove style={{ width: '800px' }}
```

- [ ] **Step 2: Make `TextNode` width responsive**

In `src/features/canvas/components/nodes/TextNode.tsx`, the `motion.div` has a dynamic width calculation. 
Change:
```tsx
        className="relative bg-transparent origin-bottom-right w-full md:w-[var(--desktop-width)]"
        style={{ '--desktop-width': paragraphs.length === 1 ? '360px' : `${Math.min(paragraphs.length, VISIBLE_COLS) * 280 + (Math.min(paragraphs.length, VISIBLE_COLS) - 1) * 16 + 48}px` } as React.CSSProperties}
```
And change the inner grid `className`:
```tsx
        <div
          className="grid gap-4 grid-cols-1 md:grid-cols-[var(--desktop-cols)]"
          style={{ '--desktop-cols': Math.min(paragraphs.length, VISIBLE_COLS) } as React.CSSProperties}
        >
          {visibleParagraphs.map((p: string, i: number) => (
```
*(Remove the inline `gridTemplateColumns` that was there).*

- [ ] **Step 3: Make `HeroNode` width responsive**

In `src/features/canvas/components/nodes/HeroNode.tsx`, change the outer `motion.div`:
```tsx
        className="relative flex flex-col items-start bg-transparent origin-bottom-left w-full max-w-full md:max-w-[900px]"
        // remove style={{ maxWidth: '900px' }}
```

- [ ] **Step 4: Commit**

```bash
git add src/features/canvas/components/nodes/ProjectNode.tsx src/features/canvas/components/nodes/TextNode.tsx src/features/canvas/components/nodes/HeroNode.tsx
git commit -m "feat: make canvas nodes responsive to mobile widths"
```

### Task 3: Adjust Project Modal Transitions

**Files:**
- Modify: `src/features/project-modal/components/ProjectModalOverlay.tsx`
- Modify: `src/features/canvas/components/nodes/ProjectNode.tsx`

- [ ] **Step 1: Only pass `sourceRect` on desktop**

In `ProjectNode.tsx`, update `handleHeroClick` to check if on mobile.
```tsx
  const handleHeroClick = () => {
    const isMobile = window.innerWidth < 768;
    const rect = heroImgRef.current?.getBoundingClientRect();
    const sourceRect = rect && !isMobile ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : undefined;
    useProjectModalStore.getState().open(reactFlowId, heroSrc, sourceRect);
  };
```

- [ ] **Step 2: Immediate settle if no `sourceRect`**

In `src/features/project-modal/components/ProjectModalOverlay.tsx`, update the `isOpen` effect around line 48:
```tsx
  useEffect(() => {
    if (isOpen) {
      if (!sourceRect) {
        setIsSettled(true);
      } else {
        const timer = setTimeout(() => setIsSettled(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, sourceRect]);
```

- [ ] **Step 3: Commit**

```bash
git add src/features/project-modal/components/ProjectModalOverlay.tsx src/features/canvas/components/nodes/ProjectNode.tsx
git commit -m "feat: support mobile transition in project modal without sourceRect"
```

### Task 4: Create `MobileStreamView`

**Files:**
- Create: `src/features/canvas/components/MobileStreamView.tsx`

- [ ] **Step 1: Write `MobileStreamView` component**

Create `src/features/canvas/components/MobileStreamView.tsx`.
This component must map over `useCanvasStore(s => s.nodes)` and render the respective node components, skipping `PromptNode` if desired, or wrapping them in a standard flex column.

```tsx
"use client";

import React, { useEffect, useRef } from 'react';
import { useCanvasStore } from '@/features/canvas/store/useCanvasStore';
import { HeroNode } from './nodes/HeroNode';
import { TextNode } from './nodes/TextNode';
import { PromptNode } from './nodes/PromptNode';
import { GhostNode } from './nodes/GhostNode';
import { ProjectNode } from './nodes/ProjectNode';
import { IntroNode } from './nodes/IntroNode';

const nodeTypes: Record<string, React.FC<any>> = {
  hero: HeroNode,
  text: TextNode,
  prompt: PromptNode,
  ghost: GhostNode,
  project: ProjectNode,
  intro: IntroNode
};

export function MobileStreamView() {
  const nodes = useCanvasStore(state => state.nodes);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new node or streaming text updates
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [nodes]);

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-[var(--canvas-bg)] p-4 pt-16 pb-40 flex flex-col gap-12 scroll-smooth">
      {nodes.map(node => {
        const Component = nodeTypes[node.type || 'text'];
        if (!Component) return null;
        
        return (
          <div key={node.id} className="w-full flex flex-col items-start relative">
            <Component data={node.data} id={node.id} />
          </div>
        );
      })}
      <div ref={bottomRef} className="h-4 w-full" />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/canvas/components/MobileStreamView.tsx
git commit -m "feat: create MobileStreamView component"
```

### Task 5: Implement Viewport Branching in `page.tsx`

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add viewport branching logic**

Import `useMediaQuery` and `MobileStreamView` at the top.
```tsx
import { useMediaQuery } from '@/core/hooks/useMediaQuery';
import { MobileStreamView } from '@/features/canvas/components/MobileStreamView';
```

Modify `Home` component to branch rendering:
```tsx
export default function Home() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  // ... existing store selectors ...

  const pageContent = isMobile ? (
    <main
      id="crt-main"
      className="w-full h-screen overflow-hidden bg-transparent relative"
      style={mainStyle}
    >
      <MobileStreamView />
      <ChatInput />
    </main>
  ) : (
    <main
      id="crt-main"
      className="w-full h-screen overflow-hidden bg-transparent relative"
      style={mainStyle}
    >
      <IntroNode />
      <EditorialCanvas>
        <InteractiveGrid />
      </EditorialCanvas>
      <ChatInput />
    </main>
  );

  return (
    <>
      <CrtEffect />
      {crtMode !== null && (
        <ReactFlowProvider>
          {isExperimental ? (
            <canvas id="crt-capture" ref={captureRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}>
              {pageContent}
            </canvas>
          ) : (
            pageContent
          )}
          <ProjectModalOverlay />
          {!isMobile && <DebugPanel />}
          {!isMobile && <TimelineScrubber />}
          {!isMobile && <FluidBackground />}
        </ReactFlowProvider>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify `ChatInput` on mobile**

Since `ChatInput` is absolutely positioned at `bottom-10` with `left-1/2 -translate-x-1/2 w-full max-w-4xl px-4`, it will float nicely over the `MobileStreamView`. The `pb-40` added in Task 4 ensures content scrolls past the input.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: branch rendering for mobile vs desktop views"
```
