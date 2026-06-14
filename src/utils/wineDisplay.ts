import type { Wine } from '../types/wine'

export type WineTypeAccent =
  | 'red'
  | 'white'
  | 'rose'
  | 'sparkling'
  | 'rose-sparkling'
  | 'other'

export function getWineTypeAccent(type: string | null): WineTypeAccent {
  const normalized = type?.trim().toLowerCase() ?? ''
  const isRose = normalized.includes('rose') || normalized.includes('rosé')
  const isSparkling = normalized.includes('spark')

  if (isSparkling && isRose) {
    return 'rose-sparkling'
  }

  if (isSparkling) {
    return 'sparkling'
  }

  if (isRose) {
    return 'rose'
  }

  if (normalized.includes('white')) {
    return 'white'
  }

  if (normalized.includes('red')) {
    return 'red'
  }

  return 'other'
}

export function formatWineDisplayName(wine: Pick<Wine, 'name' | 'producer'>): string {
  const maker = wine.producer?.trim()
  if (maker) {
    return `${maker}, ${wine.name}`
  }
  return wine.name
}

export function formatWinePrice(value: number | null): string {
  if (value === null) {
    return 'N/A'
  }

  const rounded = Number.isInteger(value) ? value : Math.round(value)
  return `${rounded.toLocaleString('ko-KR')}원`
}
