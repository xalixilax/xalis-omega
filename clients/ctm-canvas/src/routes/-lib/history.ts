import { editorStore } from './store'

/** Maximum number of undo/redo steps kept. */
export const HISTORY_LIMIT = 50

type Snapshot = {
  alpha: Uint8Array
  color: Uint8Array
}

let undoStack: Snapshot[] = []
let redoStack: Snapshot[] = []
/** Snapshot taken before an in-progress stroke; committed on pointer up. */
let pending: Snapshot | null = null

function snapshotSheets(): Snapshot | null {
  const { alpha, color } = editorStore.state
  if (alpha === null || color === null) {
    return null
  }
  return { alpha: new Uint8Array(alpha), color: new Uint8Array(color) }
}

function restoreSheets(snapshot: Snapshot): void {
  const { alpha, color } = editorStore.state
  if (alpha === null || color === null) {
    return
  }
  alpha.set(snapshot.alpha)
  color.set(snapshot.color)
  editorStore.setState((state) => ({
    ...state,
    revision: state.revision + 1,
  }))
}

/**
 * Capture the sheets before a grouped edit begins. A stroke keeps mutating
 * the live arrays; commitStroke later records the captured state as one
 * undo step.
 */
export function beginStroke(): void {
  pending = snapshotSheets()
}

/** Push the pending snapshot onto the undo stack and clear the redo stack. */
export function commitStroke(): void {
  if (pending === null) {
    return
  }
  undoStack.push(pending)
  pending = null
  if (undoStack.length > HISTORY_LIMIT) {
    undoStack.shift()
  }
  redoStack = []
}

/** Revert the sheets to the last committed state. */
export function undo(): void {
  if (pending !== null) {
    commitStroke()
  }
  const snapshot = undoStack.pop()
  if (snapshot === undefined) {
    return
  }
  const current = snapshotSheets()
  if (current !== null) {
    redoStack.push(current)
  }
  restoreSheets(snapshot)
}

/** Re-apply the most recently undone state. */
export function redo(): void {
  const snapshot = redoStack.pop()
  if (snapshot === undefined) {
    return
  }
  const current = snapshotSheets()
  if (current !== null) {
    undoStack.push(current)
    if (undoStack.length > HISTORY_LIMIT) {
      undoStack.shift()
    }
  }
  restoreSheets(snapshot)
}

/** Drop all history, e.g. when a new document is loaded. */
export function clearHistory(): void {
  undoStack = []
  redoStack = []
  pending = null
}
