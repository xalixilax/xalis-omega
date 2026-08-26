import { Store } from '@tanstack/react-store'

export type Tool = 'paint' | 'erase' | 'picker' | 'pan'
export type LayerOption = 'cutout_mipped' | 'cutout' | 'translucent'
/** Sheet the drawing tools act on. */
export type ActiveLayer = 'alpha' | 'color'
/** What the left editor canvas displays. */
export type ViewMode = 'result' | 'color' | 'alpha'

export type EditorState = {
  /**
   * Bumped after every in-place mutation of the big sheet arrays so consumers
   * (canvases) can repaint without copying arrays on each edit.
   */
  revision: number
  /** Side length N of one square tile. Null when no document is loaded. */
  tileSize: number | null
  baseName: string
  /** RGBA of the uploaded sprite, N*N*4. Read-only reference. */
  base: Uint8ClampedArray | null
  /** Binary mask per pixel per cell, 21*N*N. 1 = overlay visible. */
  alpha: Uint8Array | null
  /** RGBA per pixel per cell, 21*N*N*4. */
  color: Uint8Array | null
  palette: string[]
  activeColor: string
  activeCell: number
  tool: Tool
  activeLayer: ActiveLayer
  viewMode: ViewMode
  /** Show the overlay composite in Result view; off = pure base texture. */
  overlayVisible: boolean
  /** Percent of darkness applied to pixels outside the alpha mask (0-100). */
  maskDim: number
  /** Optional underlay texture (N*N*4) shown behind the overlay. */
  background: Uint8ClampedArray | null
  matchBlocks: string
  connectBlocks: string
  startIndex: number
  layer: LayerOption
}

export const initialEditorState: EditorState = {
  revision: 0,
  tileSize: null,
  baseName: 'overlay',
  base: null,
  alpha: null,
  color: null,
  palette: [],
  activeColor: '#ffffff',
  activeCell: 0,
  tool: 'paint',
  activeLayer: 'alpha',
  viewMode: 'result',
  overlayVisible: true,
  maskDim: 65,
  background: null,
  matchBlocks: '',
  connectBlocks: '',
  startIndex: 0,
  layer: 'cutout_mipped',
}

export const editorStore = new Store<EditorState>(initialEditorState)
