import { describe, expect, it } from 'vitest'
import { neighborsForTileIndex, tileIndexForNeighbors } from '../-lib/overlay'
import { tiles } from '../-lib/tiles'
import type { Neighbors } from '../-lib/overlay'

function emptyNeighbors(): Neighbors {
  return {
    top: false,
    right: false,
    bottom: false,
    left: false,
    'top-left': false,
    'top-right': false,
    'bottom-right': false,
    'bottom-left': false,
  }
}

function neighborsWith(
  keys: Array<keyof Neighbors>,
): Neighbors {
  const neighbors = emptyNeighbors()
  for (const key of keys) {
    neighbors[key] = true
  }
  return neighbors
}

describe('tileIndexForNeighbors', () => {
  it('maps every descriptor back to its own tile index', () => {
    for (const indexText of Object.keys(tiles)) {
      const index = Number(indexText)
      expect(tileIndexForNeighbors(neighborsForTileIndex(index))).toBe(index)
    }
  })

  it('matches nothing for an isolated block', () => {
    expect(tileIndexForNeighbors(emptyNeighbors())).toBeNull()
  })

  it('matches tile 8 for a fully connected block', () => {
    expect(
      tileIndexForNeighbors(
        neighborsWith(['top', 'right', 'bottom', 'left']),
      ),
    ).toBe(8)
  })

  it('resolves single sides', () => {
    expect(tileIndexForNeighbors(neighborsWith(['top']))).toBe(15)
    expect(tileIndexForNeighbors(neighborsWith(['right']))).toBe(7)
    expect(tileIndexForNeighbors(neighborsWith(['bottom']))).toBe(1)
    expect(tileIndexForNeighbors(neighborsWith(['left']))).toBe(9)
  })

  it('resolves diagonal-only neighbours to corner tiles', () => {
    expect(tileIndexForNeighbors(neighborsWith(['bottom-right']))).toBe(0)
    expect(tileIndexForNeighbors(neighborsWith(['bottom-left']))).toBe(2)
    expect(tileIndexForNeighbors(neighborsWith(['top-right']))).toBe(14)
    expect(tileIndexForNeighbors(neighborsWith(['top-left']))).toBe(16)
  })

  it('has no tile for straight-line side pairs', () => {
    expect(tileIndexForNeighbors(neighborsWith(['left', 'right']))).toBeNull()
    expect(tileIndexForNeighbors(neighborsWith(['top', 'bottom']))).toBeNull()
  })
})
