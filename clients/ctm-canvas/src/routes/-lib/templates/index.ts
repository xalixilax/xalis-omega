import softStoneUrl from './soft-stone.png'

export type AlphaTemplate = {
  id: string
  label: string
  url: string
}

/** Bundled alpha templates shown in the uploader picker. */
export const alphaTemplates: AlphaTemplate[] = [
  { id: 'soft-stone', label: 'Soft stone', url: softStoneUrl },
]

export const DEFAULT_TEMPLATE_ID = alphaTemplates[0]?.id ?? ''

/**
 * Convert a template image into the binary per-cell alpha mask.
 *
 * Two template encodings are supported:
 * - mask on transparency: a pixel is visible when its alpha channel > 127
 *   (bundled `soft-stone.png`: opaque black on transparent);
 * - opaque black/white: used when every pixel is fully opaque, a pixel is
 *   visible when its luminance > 127.
 */
export function alphaFromTemplate(
  templateImage: ImageData,
  tileSize: number,
): Uint8Array {
  const pixels = tileSize * tileSize
  const mask = new Uint8Array(17 * pixels)

  if (templateImage.width !== tileSize || templateImage.height !== tileSize * 3) {
    // Templates are authored at other resolutions too; scale by nearest
    // sampling instead of failing hard.
    return scaleTemplateMask(templateImage, tileSize)
  }

  let hasPartialAlpha = false
  let allOpaque = true
  for (let i = 3; i < templateImage.data.length; i += 4) {
    const a = templateImage.data[i]
    if (a !== 255) {
      allOpaque = false
    }
    if (a > 0 && a < 255) {
      hasPartialAlpha = true
      break
    }
  }

  const useLuminance = !hasPartialAlpha && allOpaque
  for (let cell = 0; cell < 17; cell++) {
    const col = cell % 7
    const row = Math.floor(cell / 7)
    for (let y = 0; y < tileSize; y++) {
      for (let x = 0; x < tileSize; x++) {
        const source =
          ((row * tileSize + y) * templateImage.width + col * tileSize + x) * 4
        let visible: boolean
        if (useLuminance) {
          const luminance =
            (templateImage.data[source] +
              templateImage.data[source + 1] +
              templateImage.data[source + 2]) /
            3
          visible = luminance > 127
        } else {
          visible = templateImage.data[source + 3] > 127
        }
        mask[cell * pixels + y * tileSize + x] = visible ? 1 : 0
      }
    }
  }
  return mask
}

function scaleTemplateMask(
  templateImage: ImageData,
  tileSize: number,
): Uint8Array {
  const pixels = tileSize * tileSize
  const mask = new Uint8Array(17 * pixels)
  const scaleX = templateImage.width / (7 * tileSize)
  const scaleY = templateImage.height / (3 * tileSize)
  for (let cell = 0; cell < 17; cell++) {
    const col = cell % 7
    const row = Math.floor(cell / 7)
    for (let y = 0; y < tileSize; y++) {
      for (let x = 0; x < tileSize; x++) {
        const sourceX = Math.min(
          templateImage.width - 1,
          Math.floor((col * tileSize + x) * scaleX),
        )
        const sourceY = Math.min(
          templateImage.height - 1,
          Math.floor((row * tileSize + y) * scaleY),
        )
        const source = (sourceY * templateImage.width + sourceX) * 4
        mask[cell * pixels + y * tileSize + x] =
          templateImage.data[source + 3] > 127 ? 1 : 0
      }
    }
  }
  return mask
}
