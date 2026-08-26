import { decodeImageFromBlob, decodeImageFromUrl } from './image'
import { hexToRgb, validateSprite } from './image'
import { extractPalette } from './image'
import { alphaFromTemplate } from './templates'
import { editorStore, initialEditorState } from './store'
import { USED_CELLS } from './sheet'
import type { LayerOption } from './store'
import type { Tool } from './store'

export type Point = { x: number; y: number }

type LoadedSheets = {
  tileSize: number
  base: Uint8ClampedArray
  alpha: Uint8Array
  color: Uint8Array
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
 * URL. The sprite is copied into base and into all 17 used color cells; the
 * template provides the initial binary alpha mask.
 */
export async function initDocument(
  spriteBlob: Blob,
  templateUrl: string | null,
  baseName: string,
): Promise<void> {
  const spriteImage = await decodeImageFromBlob(spriteBlob)
  const error = validateSprite(spriteImage)
  if (error !== null) {
    throw new Error(error)
  }

  const n = spriteImage.width
  const pixels = n * n

  const base = new Uint8ClampedArray(spriteImage.data)
  const color = new Uint8Array(USED_CELLS * pixels * 4)
  for (let cell = 0; cell < USED_CELLS; cell++) {
    color.set(spriteImage.data, cell * pixels * 4)
  }

  let alpha: Uint8Array = new Uint8Array(USED_CELLS * pixels)
  if (templateUrl !== null) {
    alpha = await decodeImageFromUrl(templateUrl).then((templateImage) =>
      alphaFromTemplate(templateImage, n),
    )
  }

  const palette = extractPalette(spriteImage)

  update({
    revision: editorStore.state.revision + 1,
    tileSize: n,
    baseName: baseName.replace(/\.png$/i, '') || 'overlay',
    base,
    alpha,
    color,
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
  alpha.set(next)
  bumpRevision()
}

export function resetDocument(): void {
  update({ ...initialEditorState })
}

export function setTool(tool: Tool): void {
  update({ tool })
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
 * Paint sets alpha=1 and writes the active color; erase clears alpha.
 */
export function paintStroke(
  cell: number,
  points: Point[],
  erase: boolean,
): void {
  const { tileSize, alpha, color, activeColor } = requireSheets()
  if (points.length === 0 || cell < 0 || cell >= USED_CELLS) {
    return
  }
  const rgb = hexToRgb(activeColor) ?? { r: 255, g: 255, b: 255 }

  for (const point of points) {
    if (
      point.x < 0 ||
      point.y < 0 ||
      point.x >= tileSize ||
      point.y >= tileSize
    ) {
      continue
    }
    const pixel = cell * tileSize * tileSize + point.y * tileSize + point.x
    if (erase) {
      alpha[pixel] = 0
    } else {
      alpha[pixel] = 1
      const source = pixel * 4
      color[source] = rgb.r
      color[source + 1] = rgb.g
      color[source + 2] = rgb.b
      color[source + 3] = 255
    }
  }
  bumpRevision()
}

/** Sample the composited color at a pixel and make it the active palette slot. */
export function pickPixel(cell: number, x: number, y: number): void {
  const { tileSize, color } = requireSheets()
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
  const source =
    (cell * tileSize * tileSize + y * tileSize + x) * 4
  const hex = `#${color[source].toString(16).padStart(2, '0')}${color[
    source + 1
  ]
    .toString(16)
    .padStart(2, '0')}${color[source + 2].toString(16).padStart(2, '0')}`
  addPaletteColor(hex)
}
