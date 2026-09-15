import { describe, expect, it } from 'vitest'
import { alphaFromTemplate } from '../-lib/templates/mask'
import type { MaskImage } from '../-lib/templates/mask'

const N = 16
const COLS = 7
const ROWS = 3

function makeSheet(
  width: number,
  height: number,
  paint: (channel: number) => number,
): MaskImage {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    for (let c = 0; c < 4; c++) {
      data[i * 4 + c] = paint(c)
    }
  }
  return { width, height, data }
}

/** Pixel index inside a full template sheet for a tile cell and tile pixel. */
function sheetPixel(cell: number, x: number, y: number): number {
  const col = cell % COLS
  const row = Math.floor(cell / COLS)
  return (row * N + y) * (COLS * N) + col * N + x
}

describe('alphaFromTemplate', () => {
  it('reads opaque black/white sheets by luminance at 7x3 tile size', () => {
    // Opaque black sheet...
    const image = makeSheet(COLS * N, ROWS * N, (channel) =>
      channel === 3 ? 255 : 0,
    )
    // ...with a white pixel at tile 0, (0,0) and tile 3, (1,1).
    const white = (cell: number, x: number, y: number) => {
      const pixel = sheetPixel(cell, x, y) * 4
      image.data[pixel] = 255
      image.data[pixel + 1] = 255
      image.data[pixel + 2] = 255
    }
    white(0, 0, 0)
    white(3, 1, 1)

    const mask = alphaFromTemplate(image, N)

    expect(mask[0 * N * N + 0 * N + 0]).toBe(1)
    expect(mask[3 * N * N + 1 * N + 1]).toBe(1)
    // Black background stays hidden: the mask must NOT be fully filled.
    expect(mask[0 * N * N + 1 * N + 1]).toBe(0)
    expect(mask[16 * N * N + 5 * N + 5]).toBe(0)
  })

  it('reads transparent sheets by alpha channel', () => {
    // Opaque white RGB, fully transparent alpha channel...
    const image = makeSheet(COLS * N, ROWS * N, (channel) =>
      channel === 3 ? 0 : 255,
    )
    // ...except tile 0, (2,2), which becomes opaque.
    image.data[sheetPixel(0, 2, 2) * 4 + 3] = 255

    const mask = alphaFromTemplate(image, N)

    expect(mask[0 * N * N + 2 * N + 2]).toBe(1)
    expect(mask[0 * N * N]).toBe(0)
    expect(mask[16 * N * N + 5 * N + 5]).toBe(0)
  })

  it('scales mismatched resolutions with the luminance encoding', () => {
    // Half resolution: 7x3 tiles of 8px, all white.
    const image = makeSheet(COLS * 8, ROWS * 8, () => 255)

    const mask = alphaFromTemplate(image, N)

    // Every sampled source pixel is white, so the mask is fully visible.
    expect(mask[0]).toBe(1)
    expect(mask[16 * N * N + 5 * N + 5]).toBe(1)
  })
})
