export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) =>
    value.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) {
    return null
  }
  const value = Number.parseInt(match[1], 16)
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  }
}

function makeCanvas(width: number, height: number): {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
} {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height)
    return { ctx: canvas.getContext('2d') as OffscreenCanvasRenderingContext2D }
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return { ctx: canvas.getContext('2d') as CanvasRenderingContext2D }
}

async function canvasToBlob(canvas: OffscreenCanvas | HTMLCanvasElement): Promise<Blob> {
  if ('convertToBlob' in canvas) {
    return canvas.convertToBlob({ type: 'image/png' })
  }
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))),
      'image/png',
    )
  })
}

export async function decodeImageFromBlob(blob: Blob): Promise<ImageData> {
  const bitmap = await createImageBitmap(blob)
  try {
    const { ctx } = makeCanvas(bitmap.width, bitmap.height)
    ctx.drawImage(bitmap, 0, 0)
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height)
  } finally {
    bitmap.close()
  }
}

export async function decodeImageFromUrl(url: string): Promise<ImageData> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch image at ${url}: ${response.status}`)
  }
  return decodeImageFromBlob(await response.blob())
}

export function validateSprite(image: ImageData): string | null {
  if (image.width !== image.height) {
    return `Texture must be square, got ${image.width}x${image.height}.`
  }
  if (image.width < 16 || image.width > 256) {
    return `Texture size must be between 16x and 256x, got ${image.width}px.`
  }
  return null
}

/**
 * Extract exact-match unique colours sorted by occurrence count, most used
 * first. Only fully opaque pixels are counted.
 */
export function extractPalette(image: ImageData, limit = 16): string[] {
  const counts = new Map<number, { count: number; first: number }>()
  const { data } = image
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] !== 255) {
      continue
    }
    const key =
      (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]
    const entry = counts.get(key)
    if (entry) {
      entry.count += 1
    } else {
      counts.set(key, { count: 1, first: i })
    }
  }
  const sorted = [...counts.entries()].sort((a, b) => {
    if (b[1].count !== a[1].count) {
      return b[1].count - a[1].count
    }
    return a[1].first - b[1].first
  })
  return sorted
    .slice(0, limit)
    .map(([key]) => rgbToHex((key >> 16) & 0xff, (key >> 8) & 0xff, key & 0xff))
}

export function encodePng(image: ImageData): Promise<Blob> {
  const { ctx } = makeCanvas(image.width, image.height)
  ctx.putImageData(image, 0, 0)
  return canvasToBlob(ctx.canvas as OffscreenCanvas | HTMLCanvasElement)
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

export function base64ToBytes(text: string): Uint8Array {
  const binary = atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
