import { USED_CELLS } from './sheet'
import type { LayerOption } from './store'

export type PropertiesInput = {
  matchBlocks: string
  connectBlocks: string
  layer: LayerOption
}

/**
 * Minimal valid Continuity `overlay` `.properties` content. Blank optional
 * lines are omitted.
 */
export function buildProperties(input: PropertiesInput): string {
  const lines = ['method=overlay', 'tiles=0-16']
  const matchBlocks = input.matchBlocks.trim()
  const connectBlocks = input.connectBlocks.trim()
  if (matchBlocks.length > 0) {
    lines.push(`matchBlocks=${matchBlocks}`)
  }
  if (connectBlocks.length > 0) {
    lines.push(`connectBlocks=${connectBlocks}`)
  }
  lines.push(`layer=${input.layer}`)
  return `${lines.join('\n')}\n`
}

/** Filename follows the resourcepack convention `<startIndex>_<block>.properties`. */
export function propertiesFileName(
  startIndex: number,
  matchBlocks: string,
): string {
  const firstBlock =
    matchBlocks
      .split(/[\s,]+/)
      .map((token) => token.replace(/^minecraft:/, '').trim())
      .find((token) => token.length > 0) ?? 'block'
  const index = Number.isInteger(startIndex) && startIndex >= 0 ? startIndex : 0
  return `${index}_${firstBlock}.properties`
}

/**
 * Build the full 7x3 result sheet as RGBA pixels. Per pixel, the hand-painted
 * colour wins, else the per-cell base pixel shows where the alpha mask is 1
 * (the base pixel's own alpha is kept, so transparent base pixels stay
 * transparent), else the pixel stays fully transparent. Cell 17 (the first
 * padding cell) always carries the plain base tile; the remaining padding
 * cells stay transparent.
 */
export type SheetImage = {
  width: number
  height: number
  data: Uint8ClampedArray<ArrayBuffer>
}

export function composeOverlaySheet(
  tileSize: number,
  base: Uint8ClampedArray,
  color: Uint8Array,
  alpha: Uint8Array,
): SheetImage {
  const width = 7 * tileSize
  const height = 3 * tileSize
  const sheet = new Uint8ClampedArray(width * height * 4)

  for (let cell = 0; cell < 17; cell++) {
    const col = cell % 7
    const row = Math.floor(cell / 7)
    const cellBase = cell * tileSize * tileSize
    for (let y = 0; y < tileSize; y++) {
      for (let x = 0; x < tileSize; x++) {
        const pixel = cellBase + y * tileSize + x
        const source = pixel * 4
        const painted = color[source + 3] === 255
        if (!painted && alpha[pixel] !== 1) {
          continue
        }
        // Colour and base are both per cell, so both read at the same index.
        const layer = painted ? color : base
        const layerAlpha = painted ? 255 : layer[source + 3]
        if (layerAlpha === 0) {
          continue
        }
        const target = ((row * tileSize + y) * width + col * tileSize + x) * 4
        sheet[target] = layer[source]
        sheet[target + 1] = layer[source + 1]
        sheet[target + 2] = layer[source + 2]
        sheet[target + 3] = layerAlpha
      }
    }
  }

  // Cell 17 (row 2, col 3): the plain base tile, untouched by mask or paint.
  const col = USED_CELLS % 7
  const row = Math.floor(USED_CELLS / 7)
  for (let y = 0; y < tileSize; y++) {
    for (let x = 0; x < tileSize; x++) {
      const source = (y * tileSize + x) * 4
      if (base[source + 3] === 0) {
        continue
      }
      const target = ((row * tileSize + y) * width + col * tileSize + x) * 4
      sheet[target] = base[source]
      sheet[target + 1] = base[source + 1]
      sheet[target + 2] = base[source + 2]
      sheet[target + 3] = base[source + 3]
    }
  }

  return { width, height, data: sheet }
}

/**
 * Build the full 7x3 alpha sheet as opaque black/white pixels: white where
 * the base shows through the alpha mask OR where a hand-painted colour sits,
 * black everywhere else. Padding cells stay black.
 */
export function composeAlphaSheet(
  tileSize: number,
  color: Uint8Array,
  alpha: Uint8Array,
): SheetImage {
  const width = 7 * tileSize
  const height = 3 * tileSize
  const sheet = new Uint8ClampedArray(width * height * 4)

  for (let cell = 0; cell < 17; cell++) {
    const col = cell % 7
    const row = Math.floor(cell / 7)
    const cellBase = cell * tileSize * tileSize
    for (let y = 0; y < tileSize; y++) {
      for (let x = 0; x < tileSize; x++) {
        const pixel = cellBase + y * tileSize + x
        const visible = alpha[pixel] === 1 || color[pixel * 4 + 3] === 255
        const value = visible ? 255 : 0
        const target = ((row * tileSize + y) * width + col * tileSize + x) * 4
        sheet[target] = value
        sheet[target + 1] = value
        sheet[target + 2] = value
        sheet[target + 3] = 255
      }
    }
  }

  return { width, height, data: sheet }
}

/** Wrap raw sheet pixels into a browser ImageData for PNG encoding. */
export function sheetToImageData(sheet: SheetImage): ImageData {
  return new ImageData(sheet.data, sheet.width, sheet.height)
}

export function downloadBlob(fileName: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadText(fileName: string, text: string): void {
  downloadBlob(fileName, new Blob([text], { type: 'text/plain' }))
}
