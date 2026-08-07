import {
  SHEET_CELL_COUNT,
  SHEET_COLS,
  SHEET_ROWS,
  TILE_COUNT,
} from "./overlay"

export type Rgba = { r: number; g: number; b: number; a: number }

export type DecodedImage = {
  width: number
  height: number
  data: Uint8ClampedArray
}

export const PALETTE_TOP_N = 16

/**
 * Wrap a Uint8ClampedArray with one guaranteed to be backed by a regular
 * ArrayBuffer (not SharedArrayBuffer), which `ImageData` constructor demands.
 */
function ab(data: Uint8ClampedArray): Uint8ClampedArray<ArrayBuffer> {
  const out = new Uint8ClampedArray(new ArrayBuffer(data.length))
  out.set(data)
  return out
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  try {
    return await loadImage(url)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = url
  })
}

export function decodeImage(img: HTMLImageElement): DecodedImage {
  const canvas = document.createElement("canvas")
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Failed to get 2d context")
  ctx.drawImage(img, 0, 0)
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return { width: canvas.width, height: canvas.height, data }
}

export function validateSquareImage(
  decoded: DecodedImage,
  accepted: number[] = [16, 32, 64],
): number {
  if (decoded.width !== decoded.height)
    throw new Error(`Image must be square, got ${decoded.width}x${decoded.height}`)
  if (!accepted.includes(decoded.width))
    throw new Error(
      `Image must be one of ${accepted.join(", ")}px; got ${decoded.width}px`,
    )
  return decoded.width
}

export type ExtractedPalette = {
  hex: string[] // top-N exact-match unique colors sorted by occurrence
}

export function extractPalette(decoded: DecodedImage): ExtractedPalette {
  const counts = new Map<string, number>()
  const { data } = decoded
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]
    if (a === 0) continue // skip fully transparent
    const hex = rgbaToHex(data[i], data[i + 1], data[i + 2], a)
    counts.set(hex, (counts.get(hex) ?? 0) + 1)
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return { hex: sorted.slice(0, PALETTE_TOP_N).map((e) => e[0]) }
}

export function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const h = (n: number) => n.toString(16).padStart(2, "0")
  return `#${h(r)}${h(g)}${h(b)}${a === 255 ? "" : h(a)}`
}

export function hexToRgba(hex: string): Rgba {
  const m = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/.exec(hex)
  if (!m) throw new Error(`Invalid hex color: ${hex}`)
  const r = parseInt(m[1].slice(0, 2), 16)
  const g = parseInt(m[1].slice(2, 4), 16)
  const b = parseInt(m[1].slice(4, 6), 16)
  const a = m[2] ? parseInt(m[2], 16) : 255
  return { r, g, b, a }
}

/**
 * Copy a single N x N decoded image into every used cell of a 21-cell color
 * sheet (RGBA). Padding cells (index 17..20) stay zeroed.
 */
export function fillColorSheetFromImage(
  decoded: DecodedImage,
): Uint8Array {
  const n = decoded.width
  const color = new Uint8Array(SHEET_CELL_COUNT * n * n * 4)
  for (let cell = 0; cell < TILE_COUNT; cell++) {
    const cellOffset = cell * n * n * 4
    color.set(decoded.data, cellOffset)
  }
  return color
}

export function fillBaseSheetFromImage(decoded: DecodedImage): Uint8ClampedArray {
  return new Uint8ClampedArray(decoded.data)
}

/**
 * Initialise the alpha sheet from a decoded template PNG.
 * Template is expected to be a 7x3 sheet at the same tile size as the input
 * (e.g. 112x48 for 16px tiles). Binary threshold: alpha > 0 == 1.
 * Padding cells default to 0 (transparent).
 */
export function fillAlphaSheetFromTemplate(
  template: DecodedImage,
  tileSize: number,
): Uint8Array {
  if (template.width !== SHEET_COLS * tileSize)
    throw new Error(
      `Template width ${template.width} does not match expected ${
        SHEET_COLS * tileSize
      }`,
    )
  if (template.height !== SHEET_ROWS * tileSize)
    throw new Error(
      `Template height ${template.height} does not match expected ${
        SHEET_ROWS * tileSize
      }`,
    )

  const alpha = new Uint8Array(SHEET_CELL_COUNT * tileSize * tileSize)
  const stride = template.width * 4

  for (let cell = 0; cell < SHEET_CELL_COUNT; cell++) {
    const cellCol = cell % SHEET_COLS
    const cellRow = Math.floor(cell / SHEET_COLS)
    const cellPixelRowOffset = cellRow * tileSize * stride
    const cellPixelColOffset = cellCol * tileSize * 4

    for (let y = 0; y < tileSize; y++) {
      const srcRowStart =
        cellPixelRowOffset + y * stride + cellPixelColOffset
      for (let x = 0; x < tileSize; x++) {
        const src = srcRowStart + x * 4
        const alphaChannel = template.data[src + 3]
        const dst = cell * tileSize * tileSize + y * tileSize + x
        alpha[dst] = alphaChannel > 0 ? 1 : 0
      }
    }
  }
  return alpha
}

/** Compose the export PNG (binary alpha x color) into a 7x3 RGBA image. */
export function composeSheetImage(opts: {
  color: Uint8Array
  alpha: Uint8Array
  tileSize: number
}): { width: number; height: number; data: Uint8ClampedArray } {
  const { color, alpha, tileSize } = opts
  const sheetWidth = SHEET_COLS * tileSize
  const sheetHeight = SHEET_ROWS * tileSize
  const rgba = new Uint8ClampedArray(sheetWidth * sheetHeight * 4)

  for (let cell = 0; cell < SHEET_CELL_COUNT; cell++) {
    const cellCol = cell % SHEET_COLS
    const cellRow = Math.floor(cell / SHEET_COLS)
    const isUsed = cell < TILE_COUNT
    const cellPixelRowOffset = cellRow * tileSize * sheetWidth
    const cellPixelColOffset = cellCol * tileSize

    for (let y = 0; y < tileSize; y++) {
      for (let x = 0; x < tileSize; x++) {
        const dstIndex =
          (cellPixelRowOffset + y * sheetWidth + cellPixelColOffset + x) * 4
        if (!isUsed) {
          rgba[dstIndex] = 0
          rgba[dstIndex + 1] = 0
          rgba[dstIndex + 2] = 0
          rgba[dstIndex + 3] = 0
          continue
        }
        const cellPixel = y * tileSize + x
        const alphaIdx = cell * tileSize * tileSize + cellPixel
        const colorIdx = alphaIdx * 4
        const a = alpha[alphaIdx]
        if (a === 1) {
          rgba[dstIndex] = color[colorIdx]
          rgba[dstIndex + 1] = color[colorIdx + 1]
          rgba[dstIndex + 2] = color[colorIdx + 2]
          rgba[dstIndex + 3] = 255
        } else {
          rgba[dstIndex] = 0
          rgba[dstIndex + 1] = 0
          rgba[dstIndex + 2] = 0
          rgba[dstIndex + 3] = 0
        }
      }
    }
  }

  return { width: sheetWidth, height: sheetHeight, data: rgba }
}

export function sheetImageToPngBlob(opts: {
  width: number
  height: number
  data: Uint8ClampedArray
}): Promise<Blob> {
  const canvas = document.createElement("canvas")
  canvas.width = opts.width
  canvas.height = opts.height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Failed to get 2d context")
  const imageData = new ImageData(ab(opts.data), opts.width, opts.height)
  ctx.putImageData(imageData, 0, 0)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("toBlob returned null"))
    }, "image/png")
  })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Encode a image data URL (base64 PNG) for localStorage persistence. */
export function imageDataToDataUrl(opts: {
  width: number
  height: number
  data: Uint8ClampedArray
}): string {
  const canvas = document.createElement("canvas")
  canvas.width = opts.width
  canvas.height = opts.height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Failed to get 2d context")
  ctx.putImageData(new ImageData(ab(opts.data), opts.width, opts.height), 0, 0)
  return canvas.toDataURL("image/png")
}

export function propertiesFileContent(opts: {
  matchBlocks: string
  connectBlocks: string
  layer?: string
}): string {
  const layer = opts.layer ?? "cutout_mipped"
  return [
    `method=overlay`,
    `tiles=0-16`,
    `matchBlocks=${opts.matchBlocks}`,
    `connectBlocks=${opts.connectBlocks}`,
    `layer=${layer}`,
  ].join("\n")
}