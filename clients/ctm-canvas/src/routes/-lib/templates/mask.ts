/** Minimal image shape used by the mask decoder (real ImageData fits). */
export type MaskImage = {
  width: number
  height: number
  data: Uint8ClampedArray | Uint8Array
}

/** Columns/rows of a template sheet match the 7x3 overlay layout. */
const TEMPLATE_COLS = 7
const TEMPLATE_ROWS = 3

/**
 * Detect the template encoding: fully opaque images are black/white sheets
 * read by luminance, anything with transparency is read by alpha channel.
 */
function usesLuminance(image: MaskImage): boolean {
  for (let i = 3; i < image.data.length; i += 4) {
    const a = image.data[i]
    if (a !== 255) {
      return false
    }
  }
  return true
}

function isVisible(image: MaskImage, source: number, luminance: boolean): boolean {
  if (luminance) {
    const gray =
      (image.data[source] + image.data[source + 1] + image.data[source + 2]) / 3
    return gray > 127
  }
  return image.data[source + 3] > 127
}

/**
 * Convert a template image into the binary per-cell alpha mask.
 *
 * Two template encodings are supported:
 * - opaque black/white: a pixel is visible when its luminance > 127
 *   (bundled templates: white foreground on black background);
 * - mask on transparency: a pixel is visible when its alpha channel > 127.
 *
 * Templates are expected at 7x3 tiles of the tile size; other resolutions
 * are scaled by nearest sampling instead of failing hard.
 */
export function alphaFromTemplate(
  templateImage: MaskImage,
  tileSize: number,
): Uint8Array {
  const pixels = tileSize * tileSize
  const luminance = usesLuminance(templateImage)

  if (
    templateImage.width !== TEMPLATE_COLS * tileSize ||
    templateImage.height !== TEMPLATE_ROWS * tileSize
  ) {
    return scaleTemplateMask(templateImage, tileSize, luminance)
  }

  const mask = new Uint8Array(17 * pixels)
  for (let cell = 0; cell < 17; cell++) {
    const col = cell % TEMPLATE_COLS
    const row = Math.floor(cell / TEMPLATE_COLS)
    for (let y = 0; y < tileSize; y++) {
      for (let x = 0; x < tileSize; x++) {
        const source =
          ((row * tileSize + y) * templateImage.width + col * tileSize + x) * 4
        mask[cell * pixels + y * tileSize + x] = isVisible(
          templateImage,
          source,
          luminance,
        )
          ? 1
          : 0
      }
    }
  }
  return mask
}

function scaleTemplateMask(
  templateImage: MaskImage,
  tileSize: number,
  luminance: boolean,
): Uint8Array {
  const pixels = tileSize * tileSize
  const mask = new Uint8Array(17 * pixels)
  const scaleX = templateImage.width / (TEMPLATE_COLS * tileSize)
  const scaleY = templateImage.height / (TEMPLATE_ROWS * tileSize)
  for (let cell = 0; cell < 17; cell++) {
    const col = cell % TEMPLATE_COLS
    const row = Math.floor(cell / TEMPLATE_COLS)
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
        mask[cell * pixels + y * tileSize + x] = isVisible(
          templateImage,
          source,
          luminance,
        )
          ? 1
          : 0
      }
    }
  }
  return mask
}
