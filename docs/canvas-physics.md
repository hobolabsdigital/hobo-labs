# Canvas Physics Engine

> Technical reference for the D3 force simulation. Read before tuning constants or adding forces.

---

## Architecture

The simulation runs in `useEditorialPhysics.ts` and is driven by D3-force. ReactFlow renders node positions; D3 owns position **computation**. They share state via `internalNodesRef` — a mutable ref synced from the Zustand store each tick.

```
useEditorialPhysics.ts
  └── d3.forceSimulation
        ├── forceX          — pushes nodes rightward based on creationIndex
        ├── forceY          — gentle vertical centering
        ├── forceManyBody   — charge repulsion between all nodes
        ├── forceLink       — spring constraints on connected pairs
        └── forceAABB       — custom rectangular collision (forceAABB.ts)
```

---

## Key Constants (`constants.ts`)

| Constant | Value | Purpose |
|---|---|---|
| `NODE_DIMS` | `{ prompt: {w:220,h:80}, ghost: {w:400,h:200}, project: {w:380,h:260}, text: {w:340,h:160} }` | Per-type bounding boxes used by AABB and spawn logic |
| `LINK_MAX_DISTANCE` | `800` | Spring becomes attractive beyond this px distance |
| `FORCE_X_STRIDE` | `550` | Horizontal offset per creation index (x-flow) |
| `AABB_GAP` | `20` | Minimum clearance between node edges after collision |

---

## AABB Collision (`forceAABB.ts`)

**Why not `d3.forceCollide`?** That force is circular — it uses radius, not width/height. Our nodes are wide rectangles; circular collision produces large invisible exclusion zones.

**Why velocity, not position?** D3 integrates `vx/vy` into `x/y` at the end of each tick. If you write to `x/y` directly inside a force, D3 overwrites your correction on the next tick. Writing to `vx/vy` survives the integration step.

```typescript
// Detection: use predicted positions (x + vx), matching D3 internals
const ax = a.x + (a.vx ?? 0);
const ay = a.y + (a.vy ?? 0);

// Overlap check (AABB)
const overlapX = (aw + bw) / 2 + AABB_GAP - Math.abs(dx);
const overlapY = (ah + bh) / 2 + AABB_GAP - Math.abs(dy);

// Resolution: push via velocity
a.vx -= (overlapX / 2) * Math.sign(dx);
b.vx += (overlapX / 2) * Math.sign(dx);
```

---

## Link Distance Cap

Without a cap, the `forceX` stride (550px × creationIndex) can push distant nodes far enough that the link spring — at default strength 0.05 — can't pull them back. Solution: clamp ideal distance to `LINK_MAX_DISTANCE` and raise strength to 0.3.

```typescript
.distance((link) => {
  const ideal = srcDims.w / 2 + tgtDims.w / 2 + 60;
  return Math.min(ideal, LINK_MAX_DISTANCE);
})
.strength(0.3)
```

At 0.3 strength, the spring exerts meaningful restoring force even against the x-flow. At 0.05 it was negligible.

---

## Spawn Positioning (`nodeFactories.ts`)

`calculateNodePosition` uses `NODE_DIMS` to compute a safe horizontal offset:

```typescript
const safeOffset = Math.max(
  H_SPACING,
  srcHalfWidth + newNodeHalfWidth + AABB_GAP
);
```

This guarantees the new node spawns with `AABB_GAP` clearance from its source, avoiding the "overlap flash" that occurred when `H_SPACING` (300px) was smaller than the combined half-widths of some node type pairs (e.g., ghost 200px + prompt 110px = 310px minimum).

---

## Tuning Guide

| Symptom | Likely cause | Knob |
|---|---|---|
| Nodes drift off-screen right | `LINK_MAX_DISTANCE` too high or strength too low | ↓ `LINK_MAX_DISTANCE`, ↑ link strength |
| Nodes cluster too tightly | AABB_GAP too small or charge too weak | ↑ `AABB_GAP`, ↑ `forceManyBody` strength |
| Initial overlap flash | `H_SPACING` < combined half-widths | ↑ `H_SPACING` or fix `NODE_DIMS` |
| Nodes snap aggressively | `velocityDecay` too low | ↑ `velocityDecay` (max 1.0) |
| Simulation never settles | `alpha` target too high | Check `alphaTarget` isn't left > 0 after re-heat |

---

## Known Non-Issues

**ReactFlow `nodeTypes` warning in dev**: The warning fires twice due to React Strict Mode double-invoking renders. `nodeTypes` is defined at module scope in `EditorialCanvas.tsx` — the reference is stable. Not a real bug; does not appear in production.
