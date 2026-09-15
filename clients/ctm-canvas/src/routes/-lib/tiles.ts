export const SIDES = ['top', 'right', 'bottom', 'left'] as const
export const CORNERS = [
  'top-left',
  'top-right',
  'bottom-right',
  'bottom-left',
] as const

export type Side = (typeof SIDES)[number]
export type Corner = (typeof CORNERS)[number]

export type Tile = {
  sides: Side[]
  corners: Corner[]
}

/**
 * Canonical Continuity `overlay` tile descriptors for indices 0-16.
 * Ported from `clients/tooling/src/data/ctm-overlay.ts`.
 */
export const tiles: Record<number, Tile> = {
  0: {
    sides: [],
    corners: ['bottom-right'],
  },
  1: {
    sides: ['bottom'],
    corners: [],
  },
  2: {
    sides: [],
    corners: ['bottom-left'],
  },
  3: {
    sides: ['bottom', 'right'],
    corners: [],
  },
  4: {
    sides: ['bottom', 'left'],
    corners: [],
  },
  5: {
    sides: ['bottom', 'left', 'right'],
    corners: [],
  },
  6: {
    sides: ['top', 'left', 'bottom'],
    corners: [],
  },
  7: {
    sides: ['right'],
    corners: [],
  },
  8: {
    sides: ['top', 'right', 'bottom', 'left'],
    corners: [],
  },
  9: {
    sides: ['left'],
    corners: [],
  },
  10: {
    sides: ['top', 'right'],
    corners: [],
  },
  11: {
    sides: ['top', 'left'],
    corners: [],
  },
  12: {
    sides: ['top', 'bottom', 'right'],
    corners: [],
  },
  13: {
    sides: ['top', 'left', 'right'],
    corners: [],
  },
  14: {
    sides: [],
    corners: ['top-right'],
  },
  15: {
    sides: ['top'],
    corners: [],
  },
  16: {
    sides: [],
    corners: ['top-left'],
  },
}
