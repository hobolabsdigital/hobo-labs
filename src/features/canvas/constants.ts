/**
 * Shared CSS class string for intro reveal transitions.
 * Applied to UI elements that should animate in after the intro sequence completes.
 */
export const INTRO_REVEAL_CLASSES = "transition-all duration-1000 ease-out";

// ---------------------------------------------------------------------------
// Layout & Node Positioning
// ---------------------------------------------------------------------------

/** Horizontal spacing between linked nodes — matches forceX stride in useEditorialPhysics */
export const H_SPACING = 300;

/** Project nodes use a wider offset to give the card room to breathe */
export const PROJECT_OFFSET = 400;

/** Default X position when there is no source node */
export const DEFAULT_X = 600;

/** Default Y position / vertical center target for physics */
export const DEFAULT_Y = 400;

/** Vertical jitter range applied to new nodes relative to source (±half) */
export const JITTER_RANGE = 80;

/** Smaller jitter for compact nodes (dossier, skeleton) */
export const JITTER_RANGE_SMALL = 60;

// ---------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------

/** Y position used during the intro animation (far above the canvas) */
export const INTRO_CAMERA_Y = -2000;

// ---------------------------------------------------------------------------
// Physics (D3)
// ---------------------------------------------------------------------------

/** Horizontal stride per creationIndex in the forceX layout */
export const FORCE_X_STRIDE = 550;

/**
 * Approximate rendered dimensions per node type (px).
 * Used by the AABB collision force and center-correction logic.
 * These don't need to be pixel-perfect — they define the collision footprint.
 */
export const NODE_DIMS: Record<string, { w: number; h: number }> = {
  hero:    { w: 750, h: 440 },
  project: { w: 800, h: 620 },
  text:    { w: 900, h: 200 },
  ghost:   { w: 400, h: 160 },
  prompt:  { w: 220, h: 90 },
  dossier: { w: 300, h: 200 },
  intro:   { w: 200, h: 200 },
};

/** Fallback for unknown node types */
export const NODE_DIMS_DEFAULT = { w: 300, h: 200 };

/** Minimum gap (px) between AABB edges after collision resolution */
export const AABB_GAP = 30;
