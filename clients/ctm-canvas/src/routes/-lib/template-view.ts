/**
 * Definition of the composition view shown in the right panel.
 *
 * The view is a block field. Each block lists the overlay tiles of the
 * sheet that render on top of it, bottom-most first; several tiles can merge
 * on one block. Tile index 17 is the sentinel for a plain block: it shows the
 * base sprite only, with no overlay pixels. Generated from
 * scripts/png-to-template/sample.png by scripts/png-to-template/convert.ts.
 */

/** Sentinel tile index: the block shows the plain base sprite, no overlay. */
export const TEMPLATE_VIEW_BASE_TILE = 17

export type TemplateViewCell = {
  /** Block position on the field, [x, y] = [column, row] from the top-left. */
  coords: readonly [number, number]
  /** Sheet tiles composited on the block, bottom-most first. */
  tiles: readonly number[]
}

export const templateViewComposition: readonly TemplateViewCell[] = [
  { coords: [0, 0], tiles: [11] },
  { coords: [1, 0], tiles: [15] },
  { coords: [2, 0], tiles: [15] },
  { coords: [3, 0], tiles: [15] },
  { coords: [4, 0], tiles: [15] },
  { coords: [5, 0], tiles: [10] },
  { coords: [0, 1], tiles: [9] },
  { coords: [1, 1], tiles: [0] },
  { coords: [2, 1], tiles: [1] },
  { coords: [3, 1], tiles: [1] },
  { coords: [4, 1], tiles: [2] },
  { coords: [5, 1], tiles: [7] },
  { coords: [0, 2], tiles: [9] },
  { coords: [1, 2], tiles: [7] },
  { coords: [2, 2], tiles: [17] },
  { coords: [3, 2], tiles: [17] },
  { coords: [4, 2], tiles: [9] },
  { coords: [5, 2], tiles: [7] },
  { coords: [0, 3], tiles: [9] },
  { coords: [1, 3], tiles: [7] },
  { coords: [2, 3], tiles: [17] },
  { coords: [3, 3], tiles: [17] },
  { coords: [4, 3], tiles: [9] },
  { coords: [5, 3], tiles: [7] },
  { coords: [0, 4], tiles: [9] },
  { coords: [1, 4], tiles: [14] },
  { coords: [2, 4], tiles: [15] },
  { coords: [3, 4], tiles: [15] },
  { coords: [4, 4], tiles: [16] },
  { coords: [5, 4], tiles: [7] },
  { coords: [0, 5], tiles: [4] },
  { coords: [1, 5], tiles: [1] },
  { coords: [2, 5], tiles: [1] },
  { coords: [3, 5], tiles: [1] },
  { coords: [4, 5], tiles: [1] },
  { coords: [5, 5], tiles: [3] },
  { coords: [0, 6], tiles: [6] },
  { coords: [1, 6], tiles: [1, 15] },
  { coords: [2, 6], tiles: [12] },
  { coords: [3, 6], tiles: [13] },
  { coords: [4, 6], tiles: [6] },
  { coords: [5, 6], tiles: [12] },
  { coords: [0, 7], tiles: [0, 11] },
  { coords: [1, 7], tiles: [1, 15] },
  { coords: [2, 7], tiles: [2, 10] },
  { coords: [3, 7], tiles: [5] },
  { coords: [4, 7], tiles: [0, 11] },
  { coords: [5, 7], tiles: [2, 10] },
  { coords: [0, 8], tiles: [7, 9] },
  { coords: [1, 8], tiles: [17] },
  { coords: [2, 8], tiles: [7, 9] },
  { coords: [3, 8], tiles: [13] },
  { coords: [4, 8], tiles: [5] },
  { coords: [5, 8], tiles: [5] },
  { coords: [0, 9], tiles: [4, 14] },
  { coords: [1, 9], tiles: [1, 15] },
  { coords: [2, 9], tiles: [3, 16] },
  { coords: [3, 9], tiles: [7, 9] },
  { coords: [4, 9], tiles: [13] },
  { coords: [5, 9], tiles: [13] },
  { coords: [0, 10], tiles: [8] },
  { coords: [1, 10], tiles: [17] },
  { coords: [2, 10], tiles: [17] },
  { coords: [3, 10], tiles: [5] },
  { coords: [4, 10], tiles: [4, 14] },
  { coords: [5, 10], tiles: [3, 16] },
  { coords: [0, 11], tiles: [17] },
  { coords: [1, 11], tiles: [11] },
  { coords: [2, 11], tiles: [10] },
  { coords: [3, 11], tiles: [17] },
  { coords: [4, 11], tiles: [0, 11] },
  { coords: [5, 11], tiles: [12] },
  { coords: [0, 12], tiles: [11] },
  { coords: [1, 12], tiles: [0, 16] },
  { coords: [2, 12], tiles: [2, 14] },
  { coords: [3, 12], tiles: [10] },
  { coords: [4, 12], tiles: [4, 14] },
  { coords: [5, 12], tiles: [12] },
  { coords: [0, 13], tiles: [4] },
  { coords: [1, 13], tiles: [2, 14] },
  { coords: [2, 13], tiles: [0, 16] },
  { coords: [3, 13], tiles: [3] },
  { coords: [4, 13], tiles: [6] },
  { coords: [5, 13], tiles: [2, 10] },
  { coords: [0, 14], tiles: [17] },
  { coords: [1, 14], tiles: [4] },
  { coords: [2, 14], tiles: [3] },
  { coords: [3, 14], tiles: [17] },
  { coords: [4, 14], tiles: [6] },
  { coords: [5, 14], tiles: [3, 16] },
]

/** Column and row count of the view, from the composition cells. */
export const templateViewSize: readonly [number, number] = (() => {
  let cols = 0
  let rows = 0
  for (const cell of templateViewComposition) {
    const [col, row] = cell.coords
    if (col + 1 > cols) {
      cols = col + 1
    }
    if (row + 1 > rows) {
      rows = row + 1
    }
  }
  return [cols, rows]
})()
