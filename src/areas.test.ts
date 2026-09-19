import { describe, expect, it } from 'vitest'
import { areaColors, areaStyle } from './areas'

describe('areaStyle', () => {
  it('points the three area properties at the named area', () => {
    expect(areaStyle('green')).toEqual({
      '--ds-area-fill': 'var(--ds-area-green-fill)',
      '--ds-area-ink': 'var(--ds-area-green-ink)',
      '--ds-area-solid': 'var(--ds-area-green-solid)',
    })
  })

  it('returns nothing when no area is given, so the component keeps its own colour', () => {
    expect(areaStyle(undefined)).toBeUndefined()
  })

  it('resolves every area the palette declares', () => {
    for (const area of areaColors) {
      expect(areaStyle(area)!['--ds-area-fill']).toBe(`var(--ds-area-${area}-fill)`)
    }
  })
})
