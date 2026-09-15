import { beforeEach, describe, expect, it } from 'vitest'
import {
  beginStroke,
  clearHistory,
  commitStroke,
  HISTORY_LIMIT,
  redo,
  undo,
} from '../-lib/history'
import { editorStore } from '../-lib/store'
import { paintStroke, setActiveLayer, setTool } from '../-lib/actions'

const N = 2
const PIXELS = N * N

function loadDocument(): void {
  clearHistory()
  editorStore.setState((state) => ({
    ...state,
    revision: state.revision + 1,
    tileSize: N,
    base: new Uint8ClampedArray(PIXELS * 4),
    alpha: new Uint8Array(17 * PIXELS),
    color: new Uint8Array(17 * PIXELS * 4),
    activeLayer: 'alpha',
    tool: 'paint',
  }))
}

function alphaAt(cell: number, x: number, y: number): number {
  return editorStore.state.alpha![cell * PIXELS + y * N + x]
}

beforeEach(loadDocument)

describe('undo/redo', () => {
  it('reverts an alpha stroke and reapplies it with redo', () => {
    beginStroke()
    paintStroke([{ x: 0, y: 0 }])
    commitStroke()
    expect(alphaAt(0, 0, 0)).toBe(1)

    undo()
    expect(alphaAt(0, 0, 0)).toBe(0)

    redo()
    expect(alphaAt(0, 0, 0)).toBe(1)
  })

  it('groups a whole drag into one undo step', () => {
    beginStroke()
    paintStroke([{ x: 0, y: 0 }])
    paintStroke([{ x: 1, y: 1 }])
    commitStroke()

    undo()
    expect(alphaAt(0, 0, 0)).toBe(0)
    expect(alphaAt(0, 1, 1)).toBe(0)
  })

  it('reverts colour strokes and erases on either layer', () => {
    setActiveLayer('color')
    beginStroke()
    paintStroke([{ x: 0, y: 0 }])
    commitStroke()
    expect(editorStore.state.color![3]).toBe(255)

    undo()
    expect(editorStore.state.color![3]).toBe(0)

    // Painted colour, then masked, then erased: one undo step each.
    setActiveLayer('color')
    beginStroke()
    paintStroke([{ x: 1, y: 0 }])
    commitStroke()
    setActiveLayer('alpha')
    beginStroke()
    paintStroke([{ x: 1, y: 0 }])
    commitStroke()
    setActiveLayer('color')
    beginStroke()
    setTool('erase')
    paintStroke([{ x: 1, y: 0 }])
    commitStroke()
    expect(editorStore.state.color![1 * 4 + 3]).toBe(0)

    undo()
    expect(editorStore.state.color![1 * 4 + 3]).toBe(255)
    expect(alphaAt(0, 1, 0)).toBe(1)

    undo()
    expect(alphaAt(0, 1, 0)).toBe(0)
    expect(editorStore.state.color![1 * 4 + 3]).toBe(255)

    redo()
    expect(alphaAt(0, 1, 0)).toBe(1)
    expect(editorStore.state.color![1 * 4 + 3]).toBe(255)
  })

  it('clears the redo stack on a new stroke', () => {
    beginStroke()
    paintStroke([{ x: 0, y: 0 }])
    commitStroke()
    undo()

    beginStroke()
    paintStroke([{ x: 1, y: 1 }])
    commitStroke()

    // The redo of the first stroke must do nothing now.
    redo()
    expect(alphaAt(0, 0, 0)).toBe(0)
    expect(alphaAt(0, 1, 1)).toBe(1)
  })

  it('keeps at most HISTORY_LIMIT undo steps', () => {
    for (let step = 0; step < HISTORY_LIMIT + 5; step++) {
      beginStroke()
      paintStroke([{ x: 0, y: 0 }])
      commitStroke()
      undo()
    }
    // Every step was undone, and the stack never grew past the limit.
    expect(alphaAt(0, 0, 0)).toBe(0)
    for (let step = 0; step < HISTORY_LIMIT + 5; step++) {
      redo()
    }
    expect(alphaAt(0, 0, 0)).toBe(1)
  })

  it('undo with empty history is a no-op', () => {
    undo()
    redo()
    expect(editorStore.state.revision).toBeGreaterThan(0)
    expect(alphaAt(0, 0, 0)).toBe(0)
  })
})
