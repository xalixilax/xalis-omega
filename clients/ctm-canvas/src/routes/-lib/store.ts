import { Store } from "@tanstack/store"
import { SHEET_CELL_COUNT, TILE_COUNT } from "./overlay"

export type Tool = "paint" | "erase" | "picker" | "pan"
export type EditingMode = "color" | "alpha"

export type EditorState = {
  ready: boolean
  tileSize: number // 16 | 32 | 64
  templateId: string

  // base sheet: original uploaded image data (N x N RGBA), read-only
  base: Uint8ClampedArray | null
  baseImage: HTMLImageElement | null

  // alpha sheet: 21 cells x N x N binary 1/0
  alpha: Uint8Array | null

  // color sheet: 21 cells x N x N x 4 RGBA
  color: Uint8Array | null

  palette: string[] // hex colors
  activeColor: string | null

  tool: Tool
  editing: EditingMode

  // export form
  matchBlocks: string
  connectBlocks: string
  blockName: string
  layer: string

  sheetWidth: number
  sheetHeight: number
}

export const initialEditorState: EditorState = {
  ready: false,
  tileSize: 16,
  templateId: "soft-stone",
  base: null,
  baseImage: null,
  alpha: null,
  color: null,
  palette: [],
  activeColor: null,
  tool: "paint",
  editing: "color",
  matchBlocks: "",
  connectBlocks: "",
  blockName: "block",
  layer: "cutout_mipped",
  sheetWidth: SHEET_CELL_COUNT /** placeholder */,
  sheetHeight: 3,
}

export const editorStore = new Store<EditorState>(initialEditorState)

export function totalCellPixels(tileSize: number): number {
  return SHEET_CELL_COUNT * tileSize * tileSize
}

export function cellStartIndex(cell: number, tileSize: number): number {
  return cell * tileSize * tileSize
}

export type PaintAtResult = "ok" | "ignored"

export function paintAtPixel(
  cell: number,
  px: number,
  py: number,
  tileSize: number,
  isRight: boolean,
): void {
  const state = editorStore.state
  if (!state.alpha || !state.color) return
  if (cell < 0 || cell >= TILE_COUNT) return
  const pixel = cellStartIndex(cell, tileSize) + py * tileSize + px
  const colorIdx = pixel * 4

  if (state.tool === "picker") {
    const r = state.color[colorIdx]
    const g = state.color[colorIdx + 1]
    const b = state.color[colorIdx + 2]
    const a = state.color[colorIdx + 3]
    if (a === 0) return
    const hex = `#${byteToHex(r)}${byteToHex(g)}${byteToHex(b)}${
      a === 255 ? "" : byteToHex(a)
    }`
    editorStore.setState((prev) => ({
      ...prev,
      activeColor: hex,
      palette: prev.palette.includes(hex)
        ? prev.palette
        : [...prev.palette, hex],
    }))
    return
  }

  if (state.tool === "pan") return

  // Right-click always erases (alpha = 0), a quick rubber for any tool.
  if (isRight || state.tool === "erase") {
    state.alpha[pixel] = 0
  } else if (state.tool === "paint") {
    state.alpha[pixel] = 1
    if (state.editing === "alpha") {
      // Reveal the existing color; write the active color only when the
      // pixel is still transparent so painting is visible on holes.
      if (state.color[colorIdx + 3] === 0 && state.activeColor) {
        const [r, g, b, a] = hexToBytes(state.activeColor, state)
        state.color[colorIdx] = r
        state.color[colorIdx + 1] = g
        state.color[colorIdx + 2] = b
        state.color[colorIdx + 3] = a
      }
    } else if (state.activeColor) {
      const [r, g, b, a] = hexToBytes(state.activeColor, state)
      state.color[colorIdx] = r
      state.color[colorIdx + 1] = g
      state.color[colorIdx + 2] = b
      state.color[colorIdx + 3] = a
    }
  }

  // Trigger re-render by replacing the alpha and color byte arrays,
  // since components compare by reference.
  editorStore.setState((prev) => ({
    ...prev,
    alpha: prev.alpha ? new Uint8Array(prev.alpha) : prev.alpha,
    color: prev.color ? new Uint8Array(prev.color) : prev.color,
  }))
}

function hexToBytes(hex: string, _state: EditorState): number[] {
  const m = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/.exec(hex)
  if (!m) return [0, 0, 0, 255]
  const r = parseInt(m[1].slice(0, 2), 16)
  const g = parseInt(m[1].slice(2, 4), 16)
  const b = parseInt(m[1].slice(4, 6), 16)
  const a = m[2] ? parseInt(m[2], 16) : 255
  return [r, g, b, a]
}

function byteToHex(b: number): string {
  return b.toString(16).padStart(2, "0")
}