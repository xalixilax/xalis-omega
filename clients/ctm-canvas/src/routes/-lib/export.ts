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
 * Build the full 7x3 overlay sheet as RGBA pixels: every used cell holds the
 * color pixels gated by the binary alpha mask, padding cells stay fully
 * transparent.
 */
export type SheetImage = {
  width: number
  height: number
  data: Uint8ClampedArray<ArrayBuffer>
}

export function composeOverlaySheet(
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
        if (alpha[pixel] === 0) {
          continue
        }
        const source = pixel * 4
        const target = ((row * tileSize + y) * width + col * tileSize + x) * 4
        sheet[target] = color[source]
        sheet[target + 1] = color[source + 1]
        sheet[target + 2] = color[source + 2]
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
