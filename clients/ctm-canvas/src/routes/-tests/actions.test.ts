import { beforeEach, describe, expect, it } from 'vitest'
import {
  baseFromSprite,
  paintStroke,
  setActiveColor,
  setActiveLayer,
  setBrushSize,
  setTool,
  sheetStateFromBaseTile,
} from '../-lib/actions'
import { editorStore } from '../-lib/store'

const N = 2
const PIXELS = N * N

/** Four distinct sprite pixels so layer separation is observable. */
const BASE = new Uint8ClampedArray([
  10, 20, 30, 255,
  40, 50, 60, 255,
  70, 80, 90, 255,
  100, 110, 120, 255,
])

function loadDocument(): void {
  editorStore.setState((state) => ({
    ...state,
    revision: state.revision + 1,
    tileSize: N,
    base: new Uint8ClampedArray(BASE),
    alpha: new Uint8Array(17 * PIXELS),
    color: new Uint8Array(17 * PIXELS * 4),
    activeLayer: 'alpha',
    tool: 'paint',
  }))
}

function alphaAt(cell: number, x: number, y: number): number {
  return editorStore.state.alpha![cell * PIXELS + y * N + x]
}

function colorAt(cell: number, x: number, y: number): Array<number> {
  const source = (cell * PIXELS + y * N + x) * 4
  return [
    editorStore.state.color![source],
    editorStore.state.color![source + 1],
    editorStore.state.color![source + 2],
  ]
}

function paintedAt(cell: number, x: number, y: number): boolean {
  const source = (cell * PIXELS + y * N + x) * 4
  return editorStore.state.color![source + 3] === 255
}

beforeEach(loadDocument)

describe('strokes on the alpha layer', () => {
  it('paint shows a base pixel and leaves the color layer untouched', () => {
    setActiveLayer('alpha')
    setTool('paint')
    paintStroke([{ x: 1, y: 0 }])

    expect(alphaAt(0, 1, 0)).toBe(1)
    expect(paintedAt(0, 1, 0)).toBe(false)
    expect(alphaAt(0, 0, 0)).toBe(0)
  })

  it('erase hides a pixel and leaves the color layer untouched', () => {
    setActiveLayer('alpha')
    setTool('paint')
    paintStroke([{ x: 0, y: 0 }])
    expect(alphaAt(0, 0, 0)).toBe(1)

    setTool('erase')
    paintStroke([{ x: 0, y: 0 }])
    expect(alphaAt(0, 0, 0)).toBe(0)
    expect(paintedAt(0, 0, 0)).toBe(false)
  })
})

describe('strokes on the color layer', () => {
  it('paint applies the active colour without touching the alpha mask', () => {
    setActiveLayer('color')
    setActiveColor('#ff0000')
    setTool('paint')
    paintStroke([{ x: 0, y: 0 }])

    expect(colorAt(0, 0, 0)).toEqual([255, 0, 0])
    expect(paintedAt(0, 0, 0)).toBe(true)
    expect(alphaAt(0, 0, 0)).toBe(0)
  })

  it('erase removes the painted pixel without touching the alpha mask', () => {
    setActiveLayer('color')
    setActiveColor('#ff0000')
    setTool('paint')
    paintStroke([{ x: 1, y: 1 }])
    expect(colorAt(0, 1, 1)).toEqual([255, 0, 0])
    expect(paintedAt(0, 1, 1)).toBe(true)

    editorStore.state.alpha![0 * PIXELS + 1 * N + 1] = 1
    setTool('erase')
    paintStroke([{ x: 1, y: 1 }])
    expect(paintedAt(0, 1, 1)).toBe(false)
    // Visibility is governed by the alpha layer only.
    expect(alphaAt(0, 1, 1)).toBe(1)
  })

  it('right-button forces an erase even with the paint tool', () => {
    setActiveLayer('color')
    setActiveColor('#ff0000')
    setTool('paint')
    paintStroke([{ x: 0, y: 1 }])
    expect(paintedAt(0, 0, 1)).toBe(true)

    paintStroke([{ x: 0, y: 1 }], true)
    expect(paintedAt(0, 0, 1)).toBe(false)
    expect(alphaAt(0, 0, 1)).toBe(0)
  })
})

describe('brush size', () => {
  it('paints a square brush on the alpha layer', () => {
    setActiveLayer('alpha')
    setBrushSize(2)
    paintStroke([{ x: 0, y: 0 }])
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        expect(alphaAt(0, x, y)).toBe(1)
      }
    }
    expect(alphaAt(1, 0, 0)).toBe(0)
  })

  it('paints a square brush on the color layer without touching the mask', () => {
    setActiveLayer('color')
    setActiveColor('#ff0000')
    setBrushSize(2)
    paintStroke([{ x: 0, y: 0 }])
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        expect(paintedAt(0, x, y)).toBe(true)
      }
    }
    expect(alphaAt(0, 0, 0)).toBe(0)
  })

  it('stamps a brush across tile boundaries', () => {
    setActiveLayer('alpha')
    setBrushSize(3)
    paintStroke([{ x: 1, y: 1 }])
    // The stamp covers sheet pixels 0..2 in both axes, spilling into the
    // neighbouring tiles: cell 1 right, cell 7 below, cell 8 diagonal.
    expect(alphaAt(0, 1, 1)).toBe(1)
    expect(alphaAt(1, 0, 1)).toBe(1)
    expect(alphaAt(1, 0, 0)).toBe(1)
    expect(alphaAt(7, 1, 0)).toBe(1)
    expect(alphaAt(8, 0, 0)).toBe(1)
    // Tiles outside the stamp stay untouched.
    expect(alphaAt(2, 0, 0)).toBe(0)
  })

  it('clamps the stored brush size', () => {
    setBrushSize(999)
    expect(editorStore.state.brushSize).toBe(64)
    setBrushSize(0)
    expect(editorStore.state.brushSize).toBe(1)
  })
})

describe('base layer import', () => {
  /** Opaque 2x2 sprite with four distinct pixels. */
  const TILE = new Uint8ClampedArray([
    1, 2, 3, 255,
    4, 5, 6, 255,
    7, 8, 9, 255,
    10, 11, 12, 255,
  ])

  it('replicates a square sprite into every cell', () => {
    const base = baseFromSprite({ width: 2, data: TILE }, 2, false)
    expect(base.length).toBe(17 * 4 * 4)
    // Cell 8 pixel 3 (x=1, y=1) matches sprite pixel 3.
    const source = (8 * 4 + 3) * 4
    expect([...base.slice(source, source + 4)]).toEqual([10, 11, 12, 255])
  })

  it('splits a 7x3 sheet into per-cell base tiles', () => {
    // 14x6 sheet where every pixel of cell N carries the red channel N.
    const sheet = new Uint8ClampedArray(14 * 6 * 4)
    for (let cell = 0; cell < 17; cell++) {
      const col = cell % 7
      const row = Math.floor(cell / 7)
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          const source = ((row * 2 + y) * 14 + col * 2 + x) * 4
          sheet[source] = cell
          sheet[source + 3] = 255
        }
      }
    }
    const base = baseFromSprite({ width: 14, data: sheet }, 2, true)
    expect(base.length).toBe(17 * 4 * 4)
    // Each cell keeps its own pixels: cell N pixel 0 reads N.
    for (const cell of [0, 5, 10, 16]) {
      expect(base[(cell * 4 + 0) * 4]).toBe(cell)
    }
    // Padding pixels of the sheet are not copied.
    expect(base[(17 * 4 + 0) * 4]).toBeUndefined()
  })
})

describe('sheet import with base tile', () => {
  const N = 2
  const COLS = 7
  const ROWS = 3

  /** Write RGBA into a 14x6 sheet cell pixel. */
  function put(
    sheet: Uint8ClampedArray,
    cell: number,
    x: number,
    y: number,
    rgba: [number, number, number, number],
  ): void {
    const col = cell % COLS
    const row = Math.floor(cell / COLS)
    const source = ((row * N + y) * (COLS * N) + col * N + x) * 4
    sheet[source] = rgba[0]
    sheet[source + 1] = rgba[1]
    sheet[source + 2] = rgba[2]
    sheet[source + 3] = rgba[3]
  }

  /** Base tile: three opaque gray pixels, one transparent. */
  const GRAY: [number, number, number, number] = [100, 100, 100, 255]
  const CLEAR: [number, number, number, number] = [0, 0, 0, 0]

  function makeSheet(withBaseTile: boolean): Uint8ClampedArray {
    const sheet = new Uint8ClampedArray(COLS * N * ROWS * N * 4)
    if (withBaseTile) {
      put(sheet, 17, 0, 0, GRAY)
      put(sheet, 17, 1, 0, GRAY)
      put(sheet, 17, 0, 1, GRAY)
      put(sheet, 17, 1, 1, CLEAR)
    }
    // Cell 0: base pixel, cut-out, painted red, equal transparent pixel.
    put(sheet, 0, 0, 0, GRAY)
    put(sheet, 0, 1, 0, CLEAR)
    put(sheet, 0, 0, 1, [255, 0, 0, 255])
    put(sheet, 0, 1, 1, CLEAR)
    // Cell 1: painted blue over the base, other pixels equal the base.
    put(sheet, 1, 0, 0, [0, 0, 255, 255])
    put(sheet, 1, 1, 0, GRAY)
    put(sheet, 1, 0, 1, GRAY)
    put(sheet, 1, 1, 1, CLEAR)
    return sheet
  }

  it('returns null when cell 17 is empty', () => {
    expect(sheetStateFromBaseTile({ width: 14, data: makeSheet(false) }, N)).toBeNull()
  })

  it('rebuilds base, mask and painted colours from the base tile', () => {
    const state = sheetStateFromBaseTile(
      { width: 14, data: makeSheet(true) },
      N,
    )
    expect(state).not.toBeNull()
    const { base, alpha, color } = state!
    expect(base.length).toBe(17 * 4 * 4)
    // The base is the plain tile, shared by every cell: cell 5 pixel 0 is
    // gray, pixel 3 transparent.
    expect([...base.slice((5 * 4 + 0) * 4, (5 * 4 + 0) * 4 + 4)]).toEqual([
      100, 100, 100, 255,
    ])
    expect(base[(5 * 4 + 3) * 4 + 3]).toBe(0)

    // Cell 0: equal pixel shows, cut-out hides, paint hides, equal
    // transparent pixel shows.
    expect([...alpha.slice(0, 4)]).toEqual([1, 0, 0, 1])
    // Cell 1: painted pixel hides, the rest show.
    expect([...alpha.slice(4, 8)]).toEqual([0, 1, 1, 1])

    // Painted colours: red at cell 0 pixel 2, blue at cell 1 pixel 0.
    expect([...color.slice(2 * 4, 2 * 4 + 4)]).toEqual([255, 0, 0, 255])
    expect([...color.slice((4 + 0) * 4, (4 + 0) * 4 + 4)]).toEqual([
      0, 0, 255, 255,
    ])
    // No other colour was painted.
    expect([...color.slice(0, 4)]).toEqual([0, 0, 0, 0])
  })
})
