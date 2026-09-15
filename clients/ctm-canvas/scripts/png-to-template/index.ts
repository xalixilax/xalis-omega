/**
 * Convert a mask PNG into the `templateViewComposition` tile list.
 *
 * The image is a grid of 3x3 px blocks (one block = one view cell). Per block,
 * every opaque pixel is part of the overlay. The script splits each block
 * pixel set into the smallest set of sheet tiles (indices 0-16) whose painted
 * pixels match exactly. A block with no opaque pixels, fully transparent or
 * fully opaque, uses the sentinel tile 17: the plain base sprite, no overlay.
 *
 * Run with bun: bun scripts/png-to-template/convert.ts [image.png] [--write]
 *   --write  overwrite src/routes/-lib/template-view.ts with the result
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { tiles } from '../../src/routes/-lib/tiles'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(scriptDir, '..', '..')
const TILE_PX = 3
const BASE_TILE = 17

const args = process.argv.slice(2)
const write = args.includes('--write')
const imagePath = join(scriptDir, args.find((a) => !a.startsWith('--')) ?? 'sample.png')
const viewPath = join(projectRoot, 'src', 'routes', '-lib', 'template-view.ts')

// --- tile masks from the canonical table in src/routes/-lib/tiles.ts ---

const SIDES = ['top', 'right', 'bottom', 'left'] as const
const CORNERS = ['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const

type Region = (typeof SIDES)[number] | (typeof CORNERS)[number]

/** Bit position of a tile pixel: [x, y] in the 3x3 block. */
function pixelBit(x: number, y: number): number {
  return 1 << (y * TILE_PX + x)
}

/** Painted-pixel mask of one side or corner name. */
function regionMask(name: Region): number {
  switch (name) {
    case 'top': return pixelBit(0, 0) | pixelBit(1, 0) | pixelBit(2, 0)
    case 'bottom': return pixelBit(0, 2) | pixelBit(1, 2) | pixelBit(2, 2)
    case 'left': return pixelBit(0, 0) | pixelBit(0, 1) | pixelBit(0, 2)
    case 'right': return pixelBit(2, 0) | pixelBit(2, 1) | pixelBit(2, 2)
    case 'top-left': return pixelBit(0, 0)
    case 'top-right': return pixelBit(2, 0)
    case 'bottom-right': return pixelBit(2, 2)
    case 'bottom-left': return pixelBit(0, 2)
  }
}

/** Tile index -> painted-pixel mask. */
function loadTileMasks(): Map<number, number> {
  const masks = new Map<number, number>()
  for (const [indexText, tile] of Object.entries(tiles)) {
    let mask = 0
    for (const region of [...tile.sides, ...tile.corners]) {
      mask |= regionMask(region)
    }
    masks.set(Number(indexText), mask)
  }
  if (masks.size === 0) {
    throw new Error('no tiles found in tiles.ts')
  }
  return masks
}

// --- PNG decode: 8-bit RGBA, non-interlaced ---

type RgbaImage = { width: number; height: number; pixels: Buffer }

function decodePng(buffer: Buffer): RgbaImage {
  let pos = 8
  let width = 0
  let height = 0
  const chunks: Buffer[] = []
  while (pos < buffer.length) {
    const length = buffer.readUInt32BE(pos)
    const type = buffer.toString('ascii', pos + 4, pos + 8)
    const data = buffer.subarray(pos + 8, pos + 8 + length)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      if (data[8] !== 8 || data[9] !== 6 || data[12] !== 0) {
        throw new Error('only 8-bit RGBA non-interlaced PNG is supported')
      }
    } else if (type === 'IDAT') {
      chunks.push(data)
    }
    pos += 12 + length
  }
  const raw = inflateSync(Buffer.concat(chunks))
  const stride = width * 4
  const pixels = Buffer.alloc(height * stride)
  let inPos = 0
  for (let y = 0; y < height; y++) {
    const filter = raw[inPos++]
    const row = y * stride
    for (let x = 0; x < stride; x++) {
      const left = x >= 4 ? pixels[row + x - 4] : 0
      const up = y > 0 ? pixels[row - stride + x] : 0
      const upLeft = y > 0 && x >= 4 ? pixels[row - stride + x - 4] : 0
      const value = raw[inPos++]
      let out: number
      switch (filter) {
        case 0: out = value; break
        case 1: out = value + left; break
        case 2: out = value + up; break
        case 3: out = value + ((left + up) >> 1); break
        case 4: {
          const p = left + up - upLeft
          const pa = Math.abs(p - left)
          const pb = Math.abs(p - up)
          const pc = Math.abs(p - upLeft)
          out = value + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft)
          break
        }
        default: throw new Error(`bad PNG filter ${filter}`)
      }
      pixels[row + x] = out & 0xff
    }
  }
  return { width, height, pixels }
}

// --- block -> tile set solver ---

/**
 * Smallest set of tiles whose masks union exactly to `target`.
 * Iterative deepening search; side tiles carry their own corner pixels, so a
 * corner-only block needs one tile per corner, up to 4 tiles on one block.
 */
function solveTiles(target: number, masks: Map<number, number>): number[] | null {
  if (target === 0) {
    return []
  }
  const candidates = [...masks.entries()]
    .filter(([, mask]) => (mask & target) === mask && mask !== 0)
    .map(([index]) => index)

  const search = (remaining: number, size: number, start: number): number[] | null => {
    if (size === 0) {
      return remaining === 0 ? [] : null
    }
    for (let i = start; i < candidates.length; i++) {
      const rest = remaining & ~masks.get(candidates[i])!
      const tail = search(rest, size - 1, i + 1)
      if (tail) {
        return [candidates[i], ...tail]
      }
    }
    return null
  }

  for (let size = 1; size <= 4; size++) {
    const found = search(target, size, 0)
    if (found) {
      return found.sort((a, b) => a - b)
    }
  }
  return null
}

// --- main ---

const masks = loadTileMasks()
const image = decodePng(readFileSync(imagePath))
const { width, height, pixels } = image
if (width % TILE_PX !== 0 || height % TILE_PX !== 0) {
  throw new Error(`image ${width}x${height} is not a whole grid of ${TILE_PX}x${TILE_PX} blocks`)
}
const cols = width / TILE_PX
const rows = height / TILE_PX
const FULL = (1 << (TILE_PX * TILE_PX)) - 1

type ViewCell = { coords: [number, number]; tiles: number[] }

const cells: ViewCell[] = []
const failures: { coords: [number, number]; target: number }[] = []
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    let target = 0
    let opaque = 0
    for (let y = 0; y < TILE_PX; y++) {
      for (let x = 0; x < TILE_PX; x++) {
        const index = (row * TILE_PX + y) * width + (col * TILE_PX + x)
        if (pixels[index * 4 + 3] > 0) {
          target |= pixelBit(x, y)
          opaque++
        }
      }
    }
    let blockTiles: number[]
    if (opaque === 0 || target === FULL) {
      blockTiles = [BASE_TILE]
    } else {
      const solved = solveTiles(target, masks)
      if (!solved) {
        failures.push({ coords: [col, row], target })
        blockTiles = []
      } else {
        blockTiles = solved
      }
    }
    cells.push({ coords: [col, row], tiles: blockTiles })
  }
}

if (failures.length > 0) {
  console.error('blocks with no exact tile set:')
  for (const failure of failures) {
    console.error(`  ${failure.coords.join(',')}: mask 0b${failure.target.toString(2).padStart(9, '0')}`)
  }
  process.exit(1)
}

const body = cells
  .map(({ coords, tiles }) => `  { coords: [${coords.join(', ')}], tiles: [${tiles.join(', ')}] },`)
  .join('\n')

const output = `/**
 * Definition of the composition view shown in the right panel.
 *
 * The view is a block field. Each block lists the overlay tiles of the
 * sheet that render on top of it, bottom-most first; several tiles can merge
 * on one block. Tile index 17 is the sentinel for a plain block: it shows the
 * base sprite only, with no overlay pixels. Generated from
 * scripts/png-to-template/sample.png by scripts/png-to-template/convert.ts.
 */

/** Sentinel tile index: the block shows the plain base sprite, no overlay. */
export const TEMPLATE_VIEW_BASE_TILE = ${BASE_TILE}

export type TemplateViewCell = {
  /** Block position on the field, [x, y] = [column, row] from the top-left. */
  coords: readonly [number, number]
  /** Sheet tiles composited on the block, bottom-most first. */
  tiles: readonly number[]
}

export const templateViewComposition: readonly TemplateViewCell[] = [
${body}
]

/** Column and row count of the view, from the composition cells. */
export const templateViewSize: readonly [number, number] = (() => {
  let cols = 0
  let rows = 0
  for (const cell of templateViewComposition) {
    const [col, row] = cell.coords
    if (col + 1 > cols) {
      cols = col + 1
    }
    if (row + 1 > rows) {
      rows = row + 1
    }
  }
  return [cols, rows]
})()
`

if (write) {
  writeFileSync(viewPath, output)
  console.log(`wrote ${viewPath}`)
} else {
  process.stdout.write(output)
}
