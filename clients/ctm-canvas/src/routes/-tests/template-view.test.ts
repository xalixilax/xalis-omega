import { describe, expect, it } from 'vitest'
import {
  templateViewComposition,
  templateViewSize,
} from '../-lib/template-view'

describe('templateViewComposition', () => {
  it('covers a 6 by 15 grid', () => {
    expect(templateViewSize).toEqual([6, 15])
    expect(templateViewComposition).toHaveLength(90)
  })
})