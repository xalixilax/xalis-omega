import { useEffect } from 'react'
import {
  bytesToBase64,
  base64ToBytes,
} from '../-lib/image'
import { editorStore } from '../-lib/store'
import type { EditorState } from '../-lib/store'
import { USED_CELLS } from '../-lib/sheet'

const STORAGE_KEY = 'ctm-canvas:v2'

type SavedState = {
  /** v2 stored a single-tile base; v3 stores a per-cell base. */
  v: 2 | 3
  tileSize: number
  baseName: string
  palette: string[]
  activeColor: string
  activeCell: number
  tool: EditorState['tool']
  activeLayer?: EditorState['activeLayer']
  viewMode?: EditorState['viewMode']
  overlayVisible?: boolean
  guidesVisible?: boolean
  backgroundOpacity?: number
  backgroundB64?: string | null
  matchBlocks: string
  connectBlocks: string
  startIndex: number
  layer: EditorState['layer']
  baseB64: string
  alphaB64: string
  colorB64: string
}

function serialize(state: EditorState): SavedState | null {
  if (
    state.tileSize === null ||
    state.base === null ||
    state.alpha === null ||
    state.color === null
  ) {
    return null
  }
  return {
    v: 3,
    tileSize: state.tileSize,
    baseName: state.baseName,
    palette: state.palette,
    activeColor: state.activeColor,
    activeCell: state.activeCell,
    tool: state.tool,
    activeLayer: state.activeLayer,
    viewMode: state.viewMode,
    overlayVisible: state.overlayVisible,
    guidesVisible: state.guidesVisible,
    backgroundOpacity: state.backgroundOpacity,
    backgroundB64:
      state.background === null ? null : bytesToBase64(state.background),
    matchBlocks: state.matchBlocks,
    connectBlocks: state.connectBlocks,
    startIndex: state.startIndex,
    layer: state.layer,
    baseB64: bytesToBase64(new Uint8Array(state.base)),
    alphaB64: bytesToBase64(state.alpha),
    colorB64: bytesToBase64(state.color),
  }
}

function deserialize(saved: SavedState): Partial<EditorState> | null {
  const { tileSize } = saved
  if (!Number.isInteger(tileSize) || tileSize < 16 || tileSize > 256) {
    return null
  }
  const pixels = tileSize * tileSize
  try {
    let base = base64ToBytes(saved.baseB64)
    const alpha = base64ToBytes(saved.alphaB64)
    const color = base64ToBytes(saved.colorB64)
    const background =
      typeof saved.backgroundB64 === 'string'
        ? base64ToBytes(saved.backgroundB64)
        : null
    // v2 sessions carried one shared tile: replicate it into every cell.
    if (base.length === pixels * 4) {
      const replicated = new Uint8Array(USED_CELLS * pixels * 4)
      for (let cell = 0; cell < USED_CELLS; cell++) {
        replicated.set(base, cell * pixels * 4)
      }
      base = replicated
    }
    if (
      base.length !== USED_CELLS * pixels * 4 ||
      alpha.length !== USED_CELLS * pixels ||
      color.length !== USED_CELLS * pixels * 4 ||
      (background !== null && background.length !== pixels * 4)
    ) {
      return null
    }
    return {
      revision: 0,
      tileSize,
      baseName: saved.baseName,
      base: new Uint8ClampedArray(base.buffer, base.byteOffset, base.length),
      alpha,
      color,
      background:
        background === null
          ? null
          : new Uint8ClampedArray(
              background.buffer,
              background.byteOffset,
              background.length,
            ),
      palette: Array.isArray(saved.palette) ? saved.palette : [],
      activeColor: saved.activeColor,
      activeCell: Math.min(Math.max(0, saved.activeCell), USED_CELLS - 1),
      tool: saved.tool,
      activeLayer:
        saved.activeLayer === 'color' || saved.activeLayer === 'alpha'
          ? saved.activeLayer
          : 'alpha',
      viewMode:
        saved.viewMode === 'result' ||
        saved.viewMode === 'color' ||
        saved.viewMode === 'alpha'
          ? saved.viewMode
          : 'result',
      overlayVisible: saved.overlayVisible !== false,
      guidesVisible: saved.guidesVisible === true,
      backgroundOpacity:
        typeof saved.backgroundOpacity === 'number' &&
        Number.isFinite(saved.backgroundOpacity)
          ? Math.min(100, Math.max(0, Math.round(saved.backgroundOpacity)))
          : 100,
      matchBlocks: saved.matchBlocks,
      connectBlocks: saved.connectBlocks,
      startIndex: saved.startIndex,
      layer: saved.layer,
    }
  } catch {
    return null
  }
}

/** Debounced local-only autosave plus restore-on-mount with user confirm. */
export function useAutosave(): void {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw)
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          ((parsed as SavedState).v === 2 || (parsed as SavedState).v === 3) &&
          window.confirm('Restore your previous editing session?')
        ) {
          const restored = deserialize(parsed as SavedState)
          if (restored !== null) {
            editorStore.setState((state) => ({
              ...state,
              ...restored,
              revision: state.revision + 1,
            }))
          }
        }
      }
    } catch {
      // Corrupt or unavailable storage: start clean.
    }

    let timer: ReturnType<typeof setTimeout> | undefined
    const subscription = editorStore.subscribe(() => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        try {
          const saved = serialize(editorStore.state)
          if (saved === null) {
            localStorage.removeItem(STORAGE_KEY)
          } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
          }
        } catch {
          // Quota exceeded or storage blocked: keep editing anyway.
        }
      }, 500)
    })
    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [])
}
