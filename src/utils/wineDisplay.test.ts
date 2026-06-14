import { describe, expect, it } from 'vitest'
import { formatWineDisplayName, formatWinePrice, getWineTypeAccent } from './wineDisplay'

describe('wineDisplay', () => {
  it('formats wine name with maker when producer exists', () => {
    expect(
      formatWineDisplayName({ name: 'Ridge Estate', producer: 'Ridge Vineyards' }),
    ).toBe('Ridge Vineyards, Ridge Estate')
  })

  it('formats wine name without maker when producer is missing', () => {
    expect(formatWineDisplayName({ name: 'Mystery Bottle', producer: null })).toBe('Mystery Bottle')
    expect(formatWineDisplayName({ name: 'Mystery Bottle', producer: '   ' })).toBe('Mystery Bottle')
  })

  it('formats prices in won', () => {
    expect(formatWinePrice(null)).toBe('N/A')
    expect(formatWinePrice(45000)).toBe('45,000원')
    expect(formatWinePrice(45.5)).toBe('46원')
  })

  it('maps wine types to accent colors', () => {
    expect(getWineTypeAccent('Red')).toBe('red')
    expect(getWineTypeAccent('White')).toBe('white')
    expect(getWineTypeAccent('Rose')).toBe('rose')
    expect(getWineTypeAccent('Sparkling')).toBe('sparkling')
    expect(getWineTypeAccent('Rose Sparkling')).toBe('rose-sparkling')
  })
})
