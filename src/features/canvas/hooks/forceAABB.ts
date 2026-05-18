import { NODE_DIMS, NODE_DIMS_DEFAULT, AABB_GAP } from '@/features/canvas/constants';

/**
 * Custom D3 force that resolves axis-aligned bounding box (AABB) overlaps.
 *
 * Unlike `d3.forceCollide()` which models every node as a circle, this force
 * uses rectangular bounding boxes per node type and resolves collisions along
 * the axis of minimum overlap. This produces tight, natural separation for
 * wide/tall nodes without the massive vertical gaps a circular model creates.
 *
 * Each simulation node must carry a `type` field to look up its dimensions.
 * Coordinates are expected to be center-corrected (i.e. `x,y` = visual center).
 */
export function forceAABB(iterations = 3) {
  let nodes: any[] = [];

  function force(alpha: number) {
    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (a.fx !== undefined && a.fy !== undefined) continue; // pinned

        const dimsA = NODE_DIMS[a.type] ?? NODE_DIMS_DEFAULT;
        const halfWA = dimsA.w / 2 + AABB_GAP / 2;
        const halfHA = dimsA.h / 2 + AABB_GAP / 2;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];

          const dimsB = NODE_DIMS[b.type] ?? NODE_DIMS_DEFAULT;
          const halfWB = dimsB.w / 2 + AABB_GAP / 2;
          const halfHB = dimsB.h / 2 + AABB_GAP / 2;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const overlapX = (halfWA + halfWB) - Math.abs(dx);
          const overlapY = (halfHA + halfHB) - Math.abs(dy);

          if (overlapX > 0 && overlapY > 0) {
            // Resolve along the axis with minimum overlap (feels more natural)
            const strength = alpha * 0.8;

            if (overlapX < overlapY) {
              // Push horizontally
              const push = overlapX * strength * 0.5;
              const signX = dx > 0 ? 1 : -1;
              const aPinned = a.fx !== undefined;
              const bPinned = b.fx !== undefined;

              if (!aPinned && !bPinned) {
                a.x -= signX * push;
                b.x += signX * push;
              } else if (!aPinned) {
                a.x -= signX * push * 2;
              } else if (!bPinned) {
                b.x += signX * push * 2;
              }
            } else {
              // Push vertically
              const push = overlapY * strength * 0.5;
              const signY = dy > 0 ? 1 : -1;
              const aPinned = a.fy !== undefined;
              const bPinned = b.fy !== undefined;

              if (!aPinned && !bPinned) {
                a.y -= signY * push;
                b.y += signY * push;
              } else if (!aPinned) {
                a.y -= signY * push * 2;
              } else if (!bPinned) {
                b.y += signY * push * 2;
              }
            }
          }
        }
      }
    }
  }

  force.initialize = (newNodes: any[]) => {
    nodes = newNodes;
  };

  return force;
}
