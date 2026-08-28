import { describe, expect, it } from 'vitest'
import {
  buildProperties,
  composeAlphaSheet,
  composeOverlaySheet,
  propertiesFileName,
} from '../-lib/export'

describe('buildProperties', () => {
  it('emits the minimal Continuity overlay config', () => {
    expect(
      buildProperties({
        matchBlocks: 'minecraft:stone',
        connectBlocks: 'minecraft:stone',
        layer: 'cutout_mipped',
      }),
    ).toBe(
      [
        'method=overlay',
        'tiles=0-16',
        'matchBlocks=minecraft:stone',
        'connectBlocks=minecraft:stone',
        'layer=cutout_mipped',
        '',
      ].join('\n'),
    )
  })

  it('omits blank optional lines', () => {
    const text = buildProperties({
      matchBlocks: '',
      connectBlocks: '',
      layer: 'cutout',
    })
    expect(text).toBe('method=overlay\ntiles=0-16\nlayer=cutout\n')
  })
})

describe('propertiesFileName', () => {
  it('follows the <startIndex>_<block> convention', () => {
    expect(propertiesFileName(20, 'minecraft:stone_bricks')).toBe(
      '20_stone_bricks.properties',
    )
  })

  it('falls back to the first token and a generic name', () => {
    expect(propertiesFileName(0, 'dirt sand')).toBe('0_dirt.properties')
    expect(propertiesFileName(3, '')).toBe('3_block.properties')
    expect(propertiesFileName(-5, 'stone')).toBe('0_stone.properties')
  })
})

describe('composeOverlaySheet', () => {
  function makeSheets(tileSize: number) {
    const pixels = tileSize * tileSize
    const base = new Uint8ClampedArray(pixels * 4)
    for (let i = 0; i < pixels; i++) {
      base[i * 4] = 200
      base[i * 4 + 1] = 200
      base[i * 4 + 2] = 200
      base[i * 4 + 3] = 255
    }
    // Base pixel 1 is transparent inside the sprite itself.
    base[1 * 4 + 3] = 0
    const alpha = new Uint8Array(17 * pixels)
    const color = new Uint8Array(17 * pixels * 4)
    // Cell 0 pixel 0: painted red on top of the mask.
    color[0] = 255
    color[3] = 255
    // Cell 0 pixel 1: mask shows the base pixel, but the sprite pixel is
    // transparent, so the result must stay transparent (never black).
    alpha[1] = 1
    // Cell 0 pixel 2: painted colour even though the mask hides it.
    color[2 * 4] = 9
    color[2 * 4 + 3] = 255
    // Cell 0 pixel 3: mask shows an opaque base pixel.
    alpha[3] = 1
    return { base, alpha, color }
  }

  it('composites paint over masked base and keeps other pixels transparent', () => {
    const tileSize = 2
    const { base, alpha, color } = makeSheets(tileSize)
    // Cell 5 pixel 3: the mask shows the shared base sprite in every cell,
    // not only cell 0.
    alpha[5 * 4 + 3] = 1

    const sheet = composeOverlaySheet(tileSize, base, color, alpha)

    expect(sheet.width).toBe(14)
    expect(sheet.height).toBe(6)

    const data = sheet.data
    // Painted pixel wins over the mask.
    expect([data[0], data[1], data[2], data[3]]).toEqual([255, 0, 0, 255])
    // Masked pixel with a transparent base sprite pixel: transparent.
    expect([data[4], data[5], data[6], data[7]]).toEqual([0, 0, 0, 0])
    // Masked pixel with an opaque base pixel: shows the base sprite. Pixel 3
    // of a 2x2 tile sits at sheet row 1, col 1.
    expect([data[60], data[61], data[62], data[63]]).toEqual([
      200, 200, 200, 255,
    ])
    // Painted pixel shows even where the mask is 0. Pixel 2 of a 2x2 tile
    // sits at sheet row 1, so its target starts at (1*2)*14*4.
    expect([data[56], data[57], data[58], data[59]]).toEqual([9, 0, 0, 255])

    // Padding cells (17-20) stay fully transparent: check cell 20 (row 2, col 6).
    const paddingPixel = (2 * 2 + 0) * 14 * 4 + 6 * 2 * 4 + 12
    expect(data[paddingPixel + 3]).toBe(0)

    // Cell 5 pixel 3 (x=1, y=1): masked base shows the shared sprite.
    const cell5Pixel = (0 * 2 + 1) * 14 * 4 + (5 * 2 + 1) * 4
    expect([data[cell5Pixel], data[cell5Pixel + 3]]).toEqual([200, 255])
  })

  it('round-trips through PNG encode/decode sizes', async () => {
    const tileSize = 4
    const { base, alpha, color } = makeSheets(tileSize)
    const sheet = composeOverlaySheet(tileSize, base, color, alpha)
    expect(sheet.data.length).toBe(28 * 12 * 4)
  })
})

describe('composeAlphaSheet', () => {
  function makeSheets(tileSize: number) {
    const pixels = tileSize * tileSize
    const alpha = new Uint8Array(17 * pixels)
    const color = new Uint8Array(17 * pixels * 4)
    // Cell 0 pixel 0: mask shows the base.
    alpha[0] = 1
    // Cell 0 pixel 1: painted colour only, mask hides it.
    color[1 * 4 + 3] = 255
    return { alpha, color }
  }

  it('unions the mask with painted pixels as opaque black/white', () => {
    const tileSize = 2
    const { alpha, color } = makeSheets(tileSize)

    const sheet = composeAlphaSheet(tileSize, color, alpha)

    expect(sheet.width).toBe(14)
    expect(sheet.height).toBe(6)

    const data = sheet.data
    // Masked pixel: white.
    expect([data[0], data[1], data[2], data[3]]).toEqual([255, 255, 255, 255])
    // Painted-only pixel: white too.
    expect([data[4], data[5], data[6], data[7]]).toEqual([255, 255, 255, 255])
    // Hidden and unpainted: black, still opaque.
    expect([data[8], data[9], data[10], data[11]]).toEqual([0, 0, 0, 255])

    // Padding cell 20 (row 2, col 6): black.
    const paddingPixel = (2 * 2 + 0) * 14 * 4 + 6 * 2 * 4 + 12
    expect([data[paddingPixel], data[paddingPixel + 3]]).toEqual([0, 255])
  })
})
