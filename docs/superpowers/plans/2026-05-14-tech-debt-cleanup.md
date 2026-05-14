# Tech Debt Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove swarm/bee feature, fix 5 tech debt items, add backlog tracking.

**Architecture:** Sequential commits — swarm removal first (biggest surface area), then independent fixes.

---

## Task 1: Remove Swarm/Bee Feature

**Files to DELETE:**
- `src/features/swarm/` (entire directory)
- `src/app/api/bee/` (entire directory)

**Files to MODIFY (remove swarm imports/usage):**
- `src/app/page.tsx` — remove Swarm, SwarmTerminal imports + JSX
- `src/features/canvas/components/EditorialCanvas.tsx` — remove useBeeStore import + activeMischief usage
- `src/features/canvas/components/DebugPanel.tsx` — remove entire Swarm Controls section + swarm target section
- `src/features/canvas/components/nodes/HeroNode.tsx` — remove useBeeStore, swarmTarget, themeOverrides
- `src/features/canvas/components/nodes/TextNode.tsx` — remove useBeeStore, swarmTarget, themeOverrides
- `src/features/editor-chat/components/ChatInput.tsx` — remove useBeeStore, setIsSleeping

## Task 2: Type the D3 Simulation Ref

**Files:**
- `src/features/canvas/store/useCanvasStore.ts` — change `simulationRef: any` to proper d3 type
- `src/features/canvas/hooks/useEditorialPhysics.ts` — already well-typed, just needs store alignment

## Task 3: ESM Imports in API Route

**Files:**
- `src/app/api/chat/route.ts` — replace all `require()` with top-level `import`

## Task 4: Decompose Ghost Node State Machine

**Files:**
- `src/features/canvas/store/useCanvasStore.ts` — split upsertActiveGhost into createGhost + updateGhost + finishGhost

## Task 5: Remove Stale ReactFlow v11 Dependency

**Files:**
- `package.json` — remove `reactflow` from dependencies

## Task 6: Auto-detect CRT Mode (Skip Selector for Non-Chrome)

**Files:**
- `src/features/crt/components/CrtModeSelector.tsx` — auto-select standard if experimental not supported
