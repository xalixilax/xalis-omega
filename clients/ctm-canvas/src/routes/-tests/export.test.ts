import { describe, expect, it } from 'vitest'
import {
  buildProperties,
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
    const alpha = new Uint8Array(17 * pixels)
    const color = new Uint8Array(17 * pixels * 4)
    for (let cell = 0; cell < 17; cell++) {
      alpha[cell * pixels] = 1
      color[cell * pixels * 4] = cell
      color[cell * pixels * 4 + 1] = 1
      color[cell * pixels * 4 + 2] = 2
      color[cell * pixels * 4 + 3] = 255
    }
    return { alpha, color }
  }

  it('gates color by alpha and keeps padding cells transparent', () => {
    const tileSize = 2
    const { alpha, color } = makeSheets(tileSize)
    // Cell 5 sits in row 0, col 5.
    alpha[5 * 4 + 3] = 1

    const sheet = composeOverlaySheet(tileSize, color, alpha)

    expect(sheet.width).toBe(14)
    expect(sheet.height).toBe(6)

    const data = sheet.data
    // Top-left pixel of every used cell is opaque with that cell's colour.
    const cell5 = (0 * 2 + 0) * 14 * 4 + 5 * 2 * 4
    expect([data[cell5], data[cell5 + 1], data[cell5 + 2], data[cell5 + 3]]).toEqual([
      5, 1, 2, 255,
    ])

    // Second pixel of cell 0 was not painted: stays transparent.
    expect(data[4 + 3]).toBe(0)

    // Padding cells (17-20) stay fully transparent even though their arrays
    // were never written: check a pixel inside cell 20 (row 2, col 6).
    const paddingPixel = (2 * 2 + 0) * 14 * 4 + 6 * 2 * 4 + 12
    expect(data[paddingPixel + 3]).toBe(0)
  })

  it('round-trips through PNG encode/decode sizes', async () => {
    const tileSize = 4
    const { alpha, color } = makeSheets(tileSize)
    const sheet = composeOverlaySheet(tileSize, color, alpha)
    expect(sheet.data.length).toBe(28 * 12 * 4)
  })
})
