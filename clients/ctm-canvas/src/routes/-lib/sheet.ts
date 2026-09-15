/** Columns of the 7x3 overlay sheet. */
export const GRID_COLS = 7
/** Rows of the 7x3 overlay sheet. */
export const GRID_ROWS = 3
/** Total cells in the sheet, including padding cells. */
export const CELL_COUNT = GRID_COLS * GRID_ROWS
/** Cells actually used by the Continuity `overlay` method (indices 0-16). */
export const USED_CELLS = 17

export function cellOrigin(index: number): { col: number; row: number } {
  return {
    col: index % GRID_COLS,
    row: Math.floor(index / GRID_COLS),
  }
}

export function cellOffsetPx(
  index: number,
  tileSize: number,
): { x: number; y: number } {
  const { col, row } = cellOrigin(index)
  return { x: col * tileSize, y: row * tileSize }
}

export function isUsedCell(index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < USED_CELLS
}
