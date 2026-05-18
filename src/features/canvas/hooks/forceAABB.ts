import { NODE_DIMS, NODE_DIMS_DEFAULT, AABB_GAP } from '@/features/canvas/constants';

/**
 * Custom D3 force that resolves axis-aligned bounding box (AABB) overlaps.
 *
 * Unlike `d3.forceCollide()` which models every node as a circle, this force
 * uses rectangular bounding boxes per node type and resolves collisions along
 * the axis of minimum overlap.
 *
 * Following D3's forceCollide convention:
 * - Uses predicted positions (x + vx, y + vy) for collision detection
 * - Modifies vx/vy (not x/y directly) so changes survive D3's velocity integration
 * - Does NOT scale with alpha (constant-strength collision)
 *
 * D3 node `x,y` are in ReactFlow's top-left coordinate space.
 * Visual centers are computed internally as (x + w/2, y + h/2).
 */
export function forceAABB(iterations = 3) {
  let nodes: any[] = [];
  let _strength = 0.7;

  function force(_alpha: number) {
    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];

        const dimsA = NODE_DIMS[a.type] ?? NODE_DIMS_DEFAULT;
        const halfWA = dimsA.w / 2 + AABB_GAP / 2;
        const halfHA = dimsA.h / 2 + AABB_GAP / 2;

        // Predicted center position (same as d3.forceCollide using x+vx)
        const cxA = (a.x + (a.vx || 0)) + dimsA.w / 2;
        const cyA = (a.y + (a.vy || 0)) + dimsA.h / 2;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];

          const dimsB = NODE_DIMS[b.type] ?? NODE_DIMS_DEFAULT;
          const halfWB = dimsB.w / 2 + AABB_GAP / 2;
          const halfHB = dimsB.h / 2 + AABB_GAP / 2;

          const cxB = (b.x + (b.vx || 0)) + dimsB.w / 2;
          const cyB = (b.y + (b.vy || 0)) + dimsB.h / 2;

          // Distance between predicted visual centers
          const dx = cxB - cxA;
          const dy = cyB - cyA;
          const overlapX = (halfWA + halfWB) - Math.abs(dx);
          const overlapY = (halfHA + halfHB) - Math.abs(dy);

          if (overlapX > 0 && overlapY > 0) {
            // Resolve along minimum overlap axis
            if (overlapX < overlapY) {
              const push = overlapX * _strength * 0.5;
              const signX = dx > 0 ? 1 : -1;
              const aPinX = a.fx != null;
              const bPinX = b.fx != null;

              if (!aPinX && !bPinX) {
                a.vx -= signX * push;
                b.vx += signX * push;
              } else if (!aPinX) {
                a.vx -= signX * push * 2;
              } else if (!bPinX) {
                b.vx += signX * push * 2;
              }
            } else {
              const push = overlapY * _strength * 0.5;
              const signY = dy > 0 ? 1 : -1;
              const aPinY = a.fy != null;
              const bPinY = b.fy != null;

              if (!aPinY && !bPinY) {
                a.vy -= signY * push;
                b.vy += signY * push;
              } else if (!aPinY) {
                a.vy -= signY * push * 2;
              } else if (!bPinY) {
                b.vy += signY * push * 2;
              }
            }
          }
        }
      }
    }
  }

  force.initialize = function(newNodes: any[]) {
    nodes = newNodes;
  };

  force.strength = function(s?: number) {
    return s !== undefined ? (_strength = s, force) : _strength;
  };

  return force;
}
