export type Side = "top" | "bottom" | "left" | "right"
export type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right"

export type TileDescriptor = {
  sides: Side[]
  corners: Corner[]
}

export const SHEET_COLS = 7
export const SHEET_ROWS = 3
export const SHEET_CELL_COUNT = SHEET_COLS * SHEET_ROWS // 21
export const TILE_COUNT = 17
export const PADDING_CELL_COUNT = SHEET_CELL_COUNT - TILE_COUNT // 4

export const overlayTiles: Record<number, TileDescriptor> = {
  0: { sides: [], corners: ["bottom-right"] },
  1: { sides: ["bottom"], corners: [] },
  2: { sides: [], corners: ["bottom-left"] },
  3: { sides: ["bottom", "right"], corners: [] },
  4: { sides: ["bottom", "left"], corners: [] },
  5: { sides: ["bottom", "left", "right"], corners: [] },
  6: { sides: ["top", "left", "bottom"], corners: [] },
  7: { sides: ["right"], corners: [] },
  8: { sides: ["top", "right", "bottom", "left"], corners: [] },
  9: { sides: ["left"], corners: [] },
  10: { sides: ["top", "right"], corners: [] },
  11: { sides: ["top", "left"], corners: [] },
  12: { sides: ["top", "bottom", "right"], corners: [] },
  13: { sides: ["top", "left", "right"], corners: [] },
  14: { sides: [], corners: ["top-right"] },
  15: { sides: ["top"], corners: [] },
  16: { sides: [], corners: ["top-left"] },
}

const SIDE_POSITION: Record<Side, [number, number]> = {
  top: [0, 1],
  bottom: [2, 1],
  left: [1, 0],
  right: [1, 2],
}

const CORNER_POSITION: Record<Corner, [number, number]> = {
  "top-left": [0, 0],
  "top-right": [0, 2],
  "bottom-left": [2, 0],
  "bottom-right": [2, 2],
}

export type NeighborPattern = {
  // 3x3 grid, [row][col]; center (1,1) is always solid=true
  solid: boolean[][]
}

export function descriptorFromPattern(pattern: NeighborPattern): TileDescriptor {
  const sides: Side[] = []
  const corners: Corner[] = []

  const isSolid = (r: number, c: number) => pattern.solid[r]?.[c] === true

  const sideConnected = (side: Side) => {
    const [r, c] = SIDE_POSITION[side]
    return isSolid(r, c)
  }

  const adjacentSidesConnected = (corner: Corner) => {
    const sides: Side[] = []
    if (corner === "top-left") sides.push("top", "left")
    if (corner === "top-right") sides.push("top", "right")
    if (corner === "bottom-left") sides.push("bottom", "left")
    if (corner === "bottom-right") sides.push("bottom", "right")
    return sides.every((s) => sideConnected(s))
  }

  if (sideConnected("top")) sides.push("top")
  if (sideConnected("bottom")) sides.push("bottom")
  if (sideConnected("left")) sides.push("left")
  if (sideConnected("right")) sides.push("right")

  ;(["top-left", "top-right", "bottom-left", "bottom-right"] as Corner[]).forEach(
    (corner) => {
      const [r, c] = CORNER_POSITION[corner]
      if (!isSolid(r, c)) return
      if (!adjacentSidesConnected(corner)) return
      corners.push(corner)
    },
  )

  return { sides, corners }
}

export function tileIndexFromPattern(pattern: NeighborPattern): number {
  const desc = descriptorFromPattern(pattern)
  for (const [idx, tile] of Object.entries(overlayTiles)) {
    if (sameDescriptor(tile, desc)) return Number(idx)
  }
  return -1
}

function sameDescriptor(a: TileDescriptor, b: TileDescriptor): boolean {
  if (a.sides.length !== b.sides.length) return false
  if (a.corners.length !== b.corners.length) return false
  for (const s of a.sides) if (!b.sides.includes(s)) return false
  for (const c of a.corners) if (!b.corners.includes(c)) return false
  return true
}

export function patternFromDescriptor(desc: TileDescriptor): NeighborPattern {
  const solid: boolean[][] = [
    [false, false, false],
    [false, true, false],
    [false, false, false],
  ]
  for (const side of desc.sides) {
    const [r, c] = SIDE_POSITION[side]
    solid[r][c] = true
  }
  for (const corner of desc.corners) {
    const [r, c] = CORNER_POSITION[corner]
    solid[r][c] = true
    // also mark the two adjacent sides solid (corners require both)
    if (corner === "top-left") {
      solid[0][1] = true
      solid[1][0] = true
    }
    if (corner === "top-right") {
      solid[0][1] = true
      solid[1][2] = true
    }
    if (corner === "bottom-left") {
      solid[2][1] = true
      solid[1][0] = true
    }
    if (corner === "bottom-right") {
      solid[2][1] = true
      solid[1][2] = true
    }
  }
  return { solid }
}

export const allTilePatterns: Record<number, NeighborPattern> = Object.fromEntries(
  Object.entries(overlayTiles).map(([idx, desc]) => [
    Number(idx),
    patternFromDescriptor(desc),
  ]),
)