import { beforeEach, describe, expect, it } from 'vitest'
import {
  paintStroke,
  setActiveColor,
  setActiveLayer,
  setBrushSize,
  setTool,
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
    paintStroke(0, [{ x: 1, y: 0 }])

    expect(alphaAt(0, 1, 0)).toBe(1)
    expect(paintedAt(0, 1, 0)).toBe(false)
    expect(alphaAt(0, 0, 0)).toBe(0)
  })

  it('erase hides a pixel and leaves the color layer untouched', () => {
    setActiveLayer('alpha')
    setTool('paint')
    paintStroke(0, [{ x: 0, y: 0 }])
    expect(alphaAt(0, 0, 0)).toBe(1)

    setTool('erase')
    paintStroke(0, [{ x: 0, y: 0 }])
    expect(alphaAt(0, 0, 0)).toBe(0)
    expect(paintedAt(0, 0, 0)).toBe(false)
  })
})

describe('strokes on the color layer', () => {
  it('paint applies the active colour without touching the alpha mask', () => {
    setActiveLayer('color')
    setActiveColor('#ff0000')
    setTool('paint')
    paintStroke(0, [{ x: 0, y: 0 }])

    expect(colorAt(0, 0, 0)).toEqual([255, 0, 0])
    expect(paintedAt(0, 0, 0)).toBe(true)
    expect(alphaAt(0, 0, 0)).toBe(0)
  })

  it('erase removes the painted pixel without touching the alpha mask', () => {
    setActiveLayer('color')
    setActiveColor('#ff0000')
    setTool('paint')
    paintStroke(0, [{ x: 1, y: 1 }])
    expect(colorAt(0, 1, 1)).toEqual([255, 0, 0])
    expect(paintedAt(0, 1, 1)).toBe(true)

    editorStore.state.alpha![0 * PIXELS + 1 * N + 1] = 1
    setTool('erase')
    paintStroke(0, [{ x: 1, y: 1 }])
    expect(paintedAt(0, 1, 1)).toBe(false)
    // Visibility is governed by the alpha layer only.
    expect(alphaAt(0, 1, 1)).toBe(1)
  })

  it('right-button forces an erase even with the paint tool', () => {
    setActiveLayer('color')
    setActiveColor('#ff0000')
    setTool('paint')
    paintStroke(0, [{ x: 0, y: 1 }])
    expect(paintedAt(0, 0, 1)).toBe(true)

    paintStroke(0, [{ x: 0, y: 1 }], true)
    expect(paintedAt(0, 0, 1)).toBe(false)
    expect(alphaAt(0, 0, 1)).toBe(0)
  })
})

describe('brush size', () => {
  it('paints a square brush on the alpha layer', () => {
    setActiveLayer('alpha')
    setBrushSize(2)
    paintStroke(0, [{ x: 0, y: 0 }])
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
    paintStroke(0, [{ x: 0, y: 0 }])
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        expect(paintedAt(0, x, y)).toBe(true)
      }
    }
    expect(alphaAt(0, 0, 0)).toBe(0)
  })

  it('clamps the brush to the tile size', () => {
    setBrushSize(999)
    expect(editorStore.state.brushSize).toBe(64)
    setActiveLayer('alpha')
    paintStroke(0, [{ x: 0, y: 0 }])
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        expect(alphaAt(0, x, y)).toBe(1)
      }
    }
    expect(alphaAt(1, 0, 0)).toBe(0)
  })
})
