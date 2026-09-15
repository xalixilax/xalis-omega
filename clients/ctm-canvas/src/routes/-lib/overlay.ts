import { CORNERS, SIDES, tiles } from './tiles'
import type { Corner, Side } from './tiles'

export type Neighbors = Record<Side | Corner, boolean>

function sameValues<T>(a: Iterable<T>, b: Iterable<T>): boolean {
  const setA = new Set(a)
  const setB = new Set(b)
  if (setA.size !== setB.size) {
    return false
  }
  for (const value of setA) {
    if (!setB.has(value)) {
      return false
    }
  }
  return true
}

/**
 * Resolve the overlay tile index (0-16) triggered by a center block's
 * connection pattern.
 *
 * Corners are literal diagonal-neighbour flags, matching the existing
 * descriptor table: tiles 0, 2, 14 and 16 cover diagonal-only neighbours,
 * while side strips already carry their own corner pixels (for example tile
 * 11 lists top + left and no corner). Returns null when nothing connects: an
 * isolated block shows no overlay at all.
 */
export function tileIndexForNeighbors(neighbors: Neighbors): number | null {
  const sides = SIDES.filter((side) => neighbors[side])
  const corners = CORNERS.filter((corner) => neighbors[corner])

  for (const indexText of Object.keys(tiles)) {
    const index = Number(indexText)
    if (
      sameValues(tiles[index].sides, sides) &&
      sameValues(tiles[index].corners, corners)
    ) {
      return index
    }
  }
  return null
}

/**
 * Neighbor booleans that trigger the given tile index, derived directly from
 * its descriptor. Used by the preview panel to wire each mini 3x3 field.
 */
export function neighborsForTileIndex(index: number): Neighbors {
  const tile = tiles[index]
  const neighbors: Neighbors = {
    top: false,
    right: false,
    bottom: false,
    left: false,
    'top-left': false,
    'top-right': false,
    'bottom-right': false,
    'bottom-left': false,
  }
  for (const side of tile.sides) {
    neighbors[side] = true
  }
  for (const corner of tile.corners) {
    neighbors[corner] = true
  }
  return neighbors
}
