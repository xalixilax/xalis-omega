import { decodeImageFromBlob, decodeImageFromUrl } from './image'
import { hexToRgb, validateSprite } from './image'
import { extractPalette } from './image'
import { alphaFromTemplate } from './templates'
import { editorStore, initialEditorState } from './store'
import { beginStroke, clearHistory, commitStroke } from './history'
import { USED_CELLS } from './sheet'
import type { ActiveLayer, LayerOption } from './store'
import type { Tool } from './store'
import type { ViewMode } from './store'

export type Point = { x: number; y: number }

type LoadedSheets = {
  tileSize: number
  base: Uint8ClampedArray
  alpha: Uint8Array
  color: Uint8Array
  background: Uint8ClampedArray | null
  activeColor: string
}

function requireSheets(): LoadedSheets {
  const state = editorStore.state
  if (
    state.tileSize === null ||
    state.base === null ||
    state.alpha === null ||
    state.color === null
  ) {
    throw new Error('No document loaded')
  }
  return {
    tileSize: state.tileSize,
    base: state.base,
    alpha: state.alpha,
    color: state.color,
    background: state.background,
    activeColor: state.activeColor,
  }
}

function update(patch: Partial<typeof editorStore.state>): void {
  editorStore.setState((state) => ({ ...state, ...patch }))
}

function bumpRevision(): void {
  editorStore.setState((state) => ({
    ...state,
    revision: state.revision + 1,
  }))
}
/**
 * Initialise a new document from the uploaded sprite and an optional template
 * URL. The sprite is copied into base (layer 1, read-only); the color layer
 * (layer 3) starts empty; the template provides the initial binary alpha
 * mask (layer 2). Without a template, the mask starts fully opaque so the
 * base texture stays visible.
 */
export async function initDocument(
  spriteBlob: Blob,
  templateUrl: string | null,
  baseName: string,
  backgroundBlob: Blob | null = null,
): Promise<void> {
  const spriteImage = await decodeImageFromBlob(spriteBlob)
  const error = validateSprite(spriteImage)
  if (error !== null) {
    throw new Error(error)
  }

  const n = spriteImage.width
  const pixels = n * n

  let background: Uint8ClampedArray | null = null
  if (backgroundBlob !== null) {
    const backgroundImage = await decodeImageFromBlob(backgroundBlob)
    const backgroundError = validateSprite(backgroundImage)
    if (backgroundError !== null) {
      throw new Error(`Background texture: ${backgroundError}`)
    }
    if (backgroundImage.width !== n) {
      throw new Error(
        `Background must be ${n}x${n} to match the sprite.`,
      )
    }
    background = new Uint8ClampedArray(backgroundImage.data)
  }

  const base = new Uint8ClampedArray(spriteImage.data)
  // Layer 3 starts empty: alpha byte 0 marks every pixel as unpainted.
  const color = new Uint8Array(USED_CELLS * pixels * 4)

  // Without a template the whole base texture stays visible.
  let alpha: Uint8Array = new Uint8Array(USED_CELLS * pixels).fill(1)
  if (templateUrl !== null) {
    alpha = await decodeImageFromUrl(templateUrl).then((templateImage) =>
      alphaFromTemplate(templateImage, n),
    )
  }

  const palette = extractPalette(spriteImage)

  clearHistory()
  update({
    revision: editorStore.state.revision + 1,
    tileSize: n,
    baseName: baseName.replace(/\.png$/i, '') || 'overlay',
    base,
    alpha,
    color,
    background,
    palette: palette.length > 0 ? palette : ['#ffffff'],
    activeColor: palette[0] ?? '#ffffff',
    activeCell: 0,
    tool: 'paint',
  })
}

/** Replace only the alpha mask with one derived from another template. */
export async function applyTemplateAlpha(templateUrl: string): Promise<void> {
  const { tileSize, alpha } = requireSheets()
  const next = await decodeImageFromUrl(templateUrl).then((templateImage) =>
    alphaFromTemplate(templateImage, tileSize),
  )
  beginStroke()
  alpha.set(next)
  commitStroke()
  bumpRevision()
}

export function resetDocument(): void {
  clearHistory()
  update({ ...initialEditorState })
}

export function setTool(tool: Tool): void {
  update({ tool })
}

/** Set the square brush side length in pixels, clamped to 1..64. */
export function setBrushSize(size: number): void {
  update({ brushSize: Math.min(64, Math.max(1, Math.round(size))) })
}

export function setActiveLayer(activeLayer: ActiveLayer): void {
  update({ activeLayer })
}

export function setViewMode(viewMode: ViewMode): void {
  update({ viewMode })
}

export function setOverlayVisible(overlayVisible: boolean): void {
  update({ overlayVisible })
}

export function setGuidesVisible(guidesVisible: boolean): void {
  update({ guidesVisible })
}

export function setBackgroundOpacity(backgroundOpacity: number): void {
  update({
    backgroundOpacity: Math.min(100, Math.max(0, Math.round(backgroundOpacity))),
  })
}

/** Set or clear the optional underlay texture used by editor and previews. */
export async function setBackground(backgroundBlob: Blob | null): Promise<void> {
  if (backgroundBlob === null) {
    update({ background: null })
    bumpRevision()
    return
  }
  const { tileSize } = requireSheets()
  const image = await decodeImageFromBlob(backgroundBlob)
  const error = validateSprite(image)
  if (error !== null) {
    throw new Error(error)
  }
  if (image.width !== tileSize) {
    throw new Error(
      `Background must be ${tileSize}x${tileSize} to match the sprite.`,
    )
  }
  update({ background: new Uint8ClampedArray(image.data) })
  bumpRevision()
}

export function setActiveCell(activeCell: number): void {
  update({ activeCell })
}

export function setActiveColor(activeColor: string): void {
  update({ activeColor })
}

export function addPaletteColor(hex: string): void {
  const rgb = hexToRgb(hex)
  if (rgb === null) {
    return
  }
  const normalized =
    hex.startsWith('#') === true ? hex.toLowerCase() : `#${hex.toLowerCase()}`
  editorStore.setState((state) => ({
    ...state,
    palette: state.palette.includes(normalized)
      ? state.palette
      : [...state.palette, normalized],
    activeColor: normalized,
  }))
}

export function setExportConfig(config: {
  matchBlocks?: string
  connectBlocks?: string
  startIndex?: number
  layer?: LayerOption
}): void {
  update(config)
}

/**
 * Apply a stroke along a dense list of pixel points inside one cell.
 *
 * On the alpha layer (layer 2), paint shows base pixels (alpha=1) and erase
 * hides them (alpha=0); colors are never touched. On the color layer
 * (layer 3), paint writes the active colour as a hand-painted pixel and erase
 * removes the paint; the alpha mask is never touched, so colour strokes show
 * no matter what the mask is. The right button forces an erase on either
 * layer. Each point stamps a square brush of brushSize pixels per side,
 * clipped to the tile.
 */
export function paintStroke(
  cell: number,
  points: Point[],
  forceErase = false,
): void {
  const state = requireSheets()
  if (points.length === 0 || cell < 0 || cell >= USED_CELLS) {
    return
  }
  const { tileSize } = state
  const editorState = editorStore.state
  const erasing = forceErase === true || editorState.tool === 'erase'
  const onAlphaLayer = editorState.activeLayer === 'alpha'
  const rgb = hexToRgb(editorState.activeColor) ?? { r: 255, g: 255, b: 255 }

  // Square brush centred on each point; clamped so it never exceeds a tile.
  const brushSize = Math.max(1, Math.min(editorState.brushSize, tileSize))
  const half = Math.floor((brushSize - 1) / 2)
  const start = -half
  const end = brushSize - half

  for (const point of points) {
    for (let dy = start; dy < end; dy++) {
      for (let dx = start; dx < end; dx++) {
        const x = point.x + dx
        const y = point.y + dy
        if (x < 0 || y < 0 || x >= tileSize || y >= tileSize) {
          continue
        }
        const pixel = cell * tileSize * tileSize + y * tileSize + x
        if (onAlphaLayer) {
          state.alpha[pixel] = erasing ? 0 : 1
          continue
        }
        applyColorStroke(state, pixel, erasing, rgb)
      }
    }
  }
  bumpRevision()
}

function applyColorStroke(
  sheets: LoadedSheets,
  pixel: number,
  erasing: boolean,
  rgb: { r: number; g: number; b: number },
): void {
  const target = pixel * 4
  if (erasing) {
    // Remove the hand-painted pixel; the alpha mask stays as-is.
    sheets.color[target + 3] = 0
    return
  }
  sheets.color[target] = rgb.r
  sheets.color[target + 1] = rgb.g
  sheets.color[target + 2] = rgb.b
  sheets.color[target + 3] = 255
}

/**
 * Sample the composited result at a pixel (painted colour, else alpha-shown
 * base, else background) and make it the active palette slot.
 */
export function pickPixel(cell: number, x: number, y: number): void {
  const { tileSize, base, color, alpha, background } = requireSheets()
  if (
    cell < 0 ||
    cell >= USED_CELLS ||
    x < 0 ||
    y < 0 ||
    x >= tileSize ||
    y >= tileSize
  ) {
    return
  }
  const pixel = cell * tileSize * tileSize + y * tileSize + x
  // `color` spans all 17 cells; `base` and `background` are single tiles.
  const colorSource = pixel * 4
  const tileSource = (y * tileSize + x) * 4
  const painted = color[colorSource + 3] === 255
  const rgb =
    painted === true
      ? { array: color, source: colorSource }
      : alpha[pixel] === 1
        ? { array: base, source: tileSource }
        : background !== null
          ? { array: background, source: tileSource }
          : null
  if (rgb === null) {
    return
  }
  const hex = `#${rgb.array[rgb.source].toString(16).padStart(2, '0')}${rgb.array[
    rgb.source + 1
  ]
    .toString(16)
    .padStart(2, '0')}${rgb.array[rgb.source + 2].toString(16).padStart(2, '0')}`
  addPaletteColor(hex)
}
