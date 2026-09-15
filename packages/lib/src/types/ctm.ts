// =============================================================================
// Helper Types and Enums
// =============================================================================

/**
 * Valid CTM method values.
 */
export type CtmMethod =
    | "ctm"
    | "ctm_compact"
    | "horizontal"
    | "vertical"
    | "horizontal+vertical"
    | "vertical+horizontal"
    | "top"
    | "random"
    | "repeat"
    | "fixed"
    | "overlay" // Note: Base overlay method
    | "overlay_ctm"
    | "overlay_random"
    | "overlay_repeat"
    | "overlay_fixed";

export type CtmMethodOverlay =
    | "overlay"
    | "overlay_ctm"
    | "overlay_random"
    | "overlay_repeat"
    | "overlay_fixed";

/**
 * Types for the 'connect' property.
 */
export type CtmConnectType = "block" | "tile" | "state";

/**
 * Valid values for the 'faces' property.
 */
export type CtmFace =
    | "bottom"
    | "top"
    | "north"
    | "south"
    | "east"
    | "west"
    | "sides" // Shorthand for north, south, east, west
    | "all"; // All faces

/**
 * Valid values for the 'symmetry' property (used in random, repeat).
 */
export type CtmSymmetry = "none" | "opposite" | "all";

/**
 * Valid values for the 'layer' property (used in overlay methods).
 */
export type CtmLayer = "cutout_mipped" | "cutout" | "translucent";