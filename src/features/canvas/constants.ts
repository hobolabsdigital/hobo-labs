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
export const FORCE_X_STRIDE = 350;

/** Collide radii by node type */
export const COLLIDE_RADII: Record<string, number> = {
  hero: 300,
  project: 350,
  text: 160,
  ghost: 100,
  dossier: 100,
};

/** Default collide radius for unrecognized node types */
export const COLLIDE_RADIUS_DEFAULT = 120;
