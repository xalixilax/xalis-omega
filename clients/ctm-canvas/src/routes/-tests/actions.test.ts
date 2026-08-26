import { beforeEach, describe, expect, it } from 'vitest'
import {
  paintStroke,
  setActiveColor,
  setActiveLayer,
  setTool,
} from '../-lib/actions'
import { editorStore } from '../-lib/store'

const N = 2
const PIXELS = N * N

/** Four distinct sprite pixels so restore behaviour is observable. */
const BASE = new Uint8ClampedArray([
  10, 20, 30, 255,
  40, 50, 60, 255,
  70, 80, 90, 255,
  100, 110, 120, 255,
])

function loadDocument(): void {
  const color = new Uint8Array(17 * PIXELS * 4)
  for (let cell = 0; cell < 17; cell++) {
    color.set(BASE, cell * PIXELS * 4)
  }
  editorStore.setState((state) => ({
    ...state,
    revision: state.revision + 1,
    tileSize: N,
    base: new Uint8ClampedArray(BASE),
    alpha: new Uint8Array(17 * PIXELS),
    color,
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

beforeEach(loadDocument)

describe('strokes on the alpha layer', () => {
  it('paint shows a pixel and leaves colors untouched', () => {
    setActiveLayer('alpha')
    setTool('paint')
    paintStroke(0, [{ x: 1, y: 0 }])

    expect(alphaAt(0, 1, 0)).toBe(1)
    expect(colorAt(0, 1, 0)).toEqual([40, 50, 60])
    expect(alphaAt(0, 0, 0)).toBe(0)
  })

  it('erase hides a pixel and leaves colors untouched', () => {
    setActiveLayer('alpha')
    setTool('erase')
    paintStroke(0, [{ x: 0, y: 0 }])
    expect(alphaAt(0, 0, 0)).toBe(0)

    // A previously visible pixel keeps its colour after hiding.
    editorStore.state.alpha![0] = 1
    paintStroke(0, [{ x: 0, y: 0 }])
    expect(alphaAt(0, 0, 0)).toBe(0)
    expect(colorAt(0, 0, 0)).toEqual([10, 20, 30])
  })
})

describe('strokes on the color layer', () => {
  it('paint applies the active colour independently of alpha', () => {
    setActiveLayer('color')
    setActiveColor('#ff0000')
    setTool('paint')
    paintStroke(0, [{ x: 0, y: 0 }])

    expect(colorAt(0, 0, 0)).toEqual([255, 0, 0])
    expect(alphaAt(0, 0, 0)).toBe(0)
  })

  it('erase restores the base sprite pixel without touching alpha', () => {
    setActiveLayer('color')
    setActiveColor('#ff0000')
    setTool('paint')
    paintStroke(0, [{ x: 1, y: 1 }])
    expect(colorAt(0, 1, 1)).toEqual([255, 0, 0])

    setTool('erase')
    paintStroke(0, [{ x: 1, y: 1 }])
    expect(colorAt(0, 1, 1)).toEqual([100, 110, 120])
    expect(editorStore.state.alpha![0]).toBe(0)
  })

  it('right-button forces an erase even with the paint tool', () => {
    setActiveLayer('color')
    setActiveColor('#ff0000')
    setTool('paint')
    paintStroke(0, [{ x: 0, y: 1 }], true)

    expect(colorAt(0, 0, 1)).toEqual([70, 80, 90])
  })
})
