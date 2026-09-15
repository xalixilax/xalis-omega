import { decodeImageFromBlob, decodeImageFromUrl } from './image'
import { hexToRgb, validateSprite } from './image'
import { extractPalette } from './image'
import { alphaFromTemplate } from './templates'
import { editorStore, initialEditorState } from './store'
import { beginStroke, clearHistory, commitStroke } from './history'
import { GRID_COLS, GRID_ROWS, USED_CELLS } from './sheet'
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
 * Build the per-cell base layer (layer 1). A square sprite is replicated
 * into every cell; a 7x3 sheet keeps its own pixels per cell, so imported
 * textures can be tweaked tile by tile.
 */
export function baseFromSprite(
  sprite: { width: number; data: Uint8ClampedArray },
  tileSize: number,
  isSheet: boolean,
): Uint8ClampedArray {
  const pixels = tileSize * tileSize
  const tileBytes = pixels * 4
  const base = new Uint8ClampedArray(USED_CELLS * tileBytes)
  if (!isSheet) {
    for (let cell = 0; cell < USED_CELLS; cell++) {
      base.set(sprite.data.subarray(0, tileBytes), cell * tileBytes)
    }
    return base
  }
  for (let cell = 0; cell < USED_CELLS; cell++) {
    const col = cell % GRID_COLS
    const row = Math.floor(cell / GRID_COLS)
    for (let y = 0; y < tileSize; y++) {
      const from =
        ((row * tileSize + y) * sprite.width + col * tileSize) * 4
      base.set(
        sprite.data.subarray(from, from + tileSize * 4),
        cell * tileBytes + y * tileSize * 4,
      )
    }
  }
  return base
}

/**
 * Rebuild the editing state from a 7x3 sheet that carries the plain base
 * tile in cell 17 (row 2, col 3), the slot the export fills. Per pixel of
 * cells 0-16: equal to the base tile shows the base (mask 1); transparent
 * over an opaque base pixel is a cut-out (mask 0); any other differing
 * opaque pixel becomes a hand-painted colour (mask 0). The base becomes the
 * plain tile, shared by every cell. Returns null when cell 17 holds no
 * opaque pixel, so callers keep the plain per-cell import.
 */
export function sheetStateFromBaseTile(
  sheet: { width: number; data: Uint8ClampedArray },
  tileSize: number,
): {
  base: Uint8ClampedArray
  alpha: Uint8Array
  color: Uint8Array
} | null {
  const pixels = tileSize * tileSize
  const tileBytes = pixels * 4
  const col = USED_CELLS % GRID_COLS
  const row = Math.floor(USED_CELLS / GRID_COLS)

  // Extract cell 17: the plain base tile.
  const baseTile = new Uint8ClampedArray(tileBytes)
  for (let y = 0; y < tileSize; y++) {
    const from = ((row * tileSize + y) * sheet.width + col * tileSize) * 4
    baseTile.set(
      sheet.data.subarray(from, from + tileSize * 4),
      y * tileSize * 4,
    )
  }
  let hasBase = false
  for (let i = 3; i < tileBytes; i += 4) {
    if (baseTile[i] !== 0) {
      hasBase = true
      break
    }
  }
  if (!hasBase) {
    return null
  }

  const base = new Uint8ClampedArray(USED_CELLS * tileBytes)
  for (let cell = 0; cell < USED_CELLS; cell++) {
    base.set(baseTile, cell * tileBytes)
  }
  const alpha = new Uint8Array(USED_CELLS * pixels)
  const color = new Uint8Array(USED_CELLS * pixels * 4)

  for (let cell = 0; cell < USED_CELLS; cell++) {
    const cellCol = cell % GRID_COLS
    const cellRow = Math.floor(cell / GRID_COLS)
    for (let y = 0; y < tileSize; y++) {
      for (let x = 0; x < tileSize; x++) {
        const pixel = cell * pixels + y * tileSize + x
        const from =
          ((cellRow * tileSize + y) * sheet.width +
            cellCol * tileSize +
            x) *
          4
        const tile = (y * tileSize + x) * 4
        const same =
          sheet.data[from] === baseTile[tile] &&
          sheet.data[from + 1] === baseTile[tile + 1] &&
          sheet.data[from + 2] === baseTile[tile + 2] &&
          sheet.data[from + 3] === baseTile[tile + 3]
        if (same) {
          alpha[pixel] = 1
          continue
        }
        if (sheet.data[from + 3] === 0) {
          // Cut out over an opaque base pixel: the mask stays 0.
          continue
        }
        // Differing opaque pixel: a hand-painted colour over a hidden base.
        color[pixel * 4] = sheet.data[from]
        color[pixel * 4 + 1] = sheet.data[from + 1]
        color[pixel * 4 + 2] = sheet.data[from + 2]
        color[pixel * 4 + 3] = 255
      }
    }
  }
  return { base, alpha, color }
}

/**
 * Initialise a new document from an uploaded texture and an optional template
 * URL. The upload is either a square sprite (replicated into the base, layer
 * 1) or a full 7x3 sheet. A sheet with the plain base tile in cell 17
 * rebuilds the previous state: shared base, derived alpha mask and painted
 * colours. Any other sheet keeps its own pixels per cell. The color layer
 * (layer 3) starts empty otherwise; the template provides the initial binary
 * alpha mask (layer 2). Without a template, the mask starts fully opaque so
 * the base texture stays visible.
 */
export async function initDocument(
  spriteBlob: Blob,
  templateUrl: string | null,
  baseName: string,
  backgroundBlob: Blob | null = null,
): Promise<void> {
  const spriteImage = await decodeImageFromBlob(spriteBlob)
  const isSheet =
    spriteImage.width % GRID_COLS === 0 &&
    spriteImage.height === (spriteImage.width / GRID_COLS) * GRID_ROWS
  let error: string | null
  let n: number
  if (isSheet) {
    n = spriteImage.width / GRID_COLS
    error =
      n < 16 || n > 256
        ? `Sheet tiles must be between 16x and 256x, got ${n}px.`
        : null
  } else {
    error = validateSprite(spriteImage)
    n = spriteImage.width
  }
  if (error !== null) {
    throw new Error(error)
  }
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

  // A sheet with the base tile in cell 17 rebuilds its editing state; other
  // uploads start from per-cell pixels with no paint. The derived mask wins
  // over the template select: it is the sheet's own state.
  const rebuilt = isSheet ? sheetStateFromBaseTile(spriteImage, n) : null
  const base =
    rebuilt !== null ? rebuilt.base : baseFromSprite(spriteImage, n, isSheet)
  const color =
    rebuilt !== null
      ? rebuilt.color
      : // Layer 3 starts empty: alpha byte 0 marks every pixel as unpainted.
        new Uint8Array(USED_CELLS * pixels * 4)

  let alpha: Uint8Array
  if (rebuilt !== null) {
    alpha = rebuilt.alpha
  } else {
    // Without a template the whole base texture stays visible.
    alpha = new Uint8Array(USED_CELLS * pixels).fill(1)
    if (templateUrl !== null) {
      alpha = await decodeImageFromUrl(templateUrl).then((templateImage) =>
        alphaFromTemplate(templateImage, n),
      )
    }
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
 * Apply a stroke along a dense list of pixel points in whole-sheet
 * coordinates (0..GRID_COLS*N-1, 0..GRID_ROWS*N-1).
 *
 * On the alpha layer (layer 2), paint shows base pixels (alpha=1) and erase
 * hides them (alpha=0); colors are never touched. On the color layer
 * (layer 3), paint writes the active colour as a hand-painted pixel and erase
 * removes the paint; the alpha mask is never touched, so colour strokes show
 * no matter what the mask is. The right button forces an erase on either
 * layer. Each point stamps a square brush of brushSize pixels per side; the
 * stamp crosses tile boundaries freely, only clipped at the sheet edges.
 */
export function paintStroke(points: Point[], forceErase = false): void {
  const state = requireSheets()
  if (points.length === 0) {
    return
  }
  const { tileSize } = state
  const editorState = editorStore.state
  const sheetWidth = GRID_COLS * tileSize
  const sheetHeight = GRID_ROWS * tileSize
  const erasing = forceErase === true || editorState.tool === 'erase'
  const onAlphaLayer = editorState.activeLayer === 'alpha'
  const rgb = hexToRgb(editorState.activeColor) ?? { r: 255, g: 255, b: 255 }

  // Square brush centred on each point.
  const brushSize = Math.max(1, editorState.brushSize)
  const half = Math.floor((brushSize - 1) / 2)
  const start = -half
  const end = brushSize - half
  const pixelsPerTile = tileSize * tileSize

  for (const point of points) {
    for (let dy = start; dy < end; dy++) {
      const y = point.y + dy
      if (y < 0 || y >= sheetHeight) {
        continue
      }
      const cellRow = Math.floor(y / tileSize)
      const localY = y - cellRow * tileSize
      for (let dx = start; dx < end; dx++) {
        const x = point.x + dx
        if (x < 0 || x >= sheetWidth) {
          continue
        }
        const cellCol = Math.floor(x / tileSize)
        const cell = cellRow * GRID_COLS + cellCol
        const pixel =
          cell * pixelsPerTile +
          localY * tileSize +
          (x - cellCol * tileSize)
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
  // `color` and `base` span all 17 cells; `background` is a single tile.
  const colorSource = pixel * 4
  const tileSource = (y * tileSize + x) * 4
  const painted = color[colorSource + 3] === 255
  const rgb =
    painted === true
      ? { array: color, source: colorSource }
      : alpha[pixel] === 1
        ? { array: base, source: colorSource }
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
