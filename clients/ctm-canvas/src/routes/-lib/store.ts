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
  /**
   * Layer 1: RGBA of the uploaded sprite, N*N*4. Read-only; never modified.
   */
  base: Uint8ClampedArray | null
  /**
   * Layer 2: binary mask per pixel per cell, 17*N*N. 1 shows the base pixel,
   * 0 hides it. Gates layer 1 only, never layer 3.
   */
  alpha: Uint8Array | null
  /**
   * Layer 3: RGBA per pixel per cell, 17*N*N*4. Independent of the alpha
   * mask; alpha byte 255 = hand-painted pixel, 0 = no paint.
   */
  color: Uint8Array | null
  palette: string[]
  activeColor: string
  activeCell: number
  tool: Tool
  /** Side length of the square brush, in pixels (1 = single pixel). */
  brushSize: number
  activeLayer: ActiveLayer
  viewMode: ViewMode
  /** Show the composite in Result view; off = pure underlay for comparison. */
  overlayVisible: boolean
  /** Show the per-tile connection guides (dashed side/corner markers). */
  guidesVisible: boolean
  /** Percent of opacity for layer 0 (background) in Result view (0-100). */
  backgroundOpacity: number
  /** Layer 0: optional underlay texture (N*N*4) behind the composite. */
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
  brushSize: 1,
  activeLayer: 'alpha',
  viewMode: 'result',
  overlayVisible: true,
  guidesVisible: false,
  backgroundOpacity: 100,
  background: null,
  matchBlocks: '',
  connectBlocks: '',
  startIndex: 0,
  layer: 'cutout_mipped',
}

export const editorStore = new Store<EditorState>(initialEditorState)
