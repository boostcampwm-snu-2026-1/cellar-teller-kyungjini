import type { Wine } from '../types/wine'
import { formatWineDisplayName } from './wineDisplay'

export type SimplifiedWineType = 'red' | 'white' | 'rose' | 'sparkling' | 'other'

export function getSlotKey(row: number, column: number, depth = 1): string {
  return `${row}-${column}-${depth}`
}

export function isPositionedCellarWine(wine: Wine): boolean {
  return wine.isCellar && wine.rowNum !== null && wine.colNum !== null
}

export function getVerticalBottleOrientation(column: number): 'up' | 'down' {
  return column % 2 === 1 ? 'up' : 'down'
}

export function simplifyWineType(type: string | null): SimplifiedWineType {
  const normalized = type?.trim().toLowerCase() ?? ''

  if (normalized.includes('spark')) {
    return 'sparkling'
  }

  if (normalized.includes('rose') || normalized.includes('rosé')) {
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

export function buildWinesBySlot(wines: Wine[]): Map<string, Wine[]> {
  const slots = new Map<string, Wine[]>()

  for (const wine of wines.filter(isPositionedCellarWine)) {
    const key = getSlotKey(wine.rowNum!, wine.colNum!, wine.depthNum ?? 1)
    const existing = slots.get(key) ?? []
    slots.set(key, [...existing, wine])
  }

  return slots
}

export function getWineAtSlot(
  slotsByKey: Map<string, Wine[]>,
  row: number,
  column: number,
  depth: number,
): Wine | null {
  return slotsByKey.get(getSlotKey(row, column, depth))?.[0] ?? null
}

export function formatWineHoverLabel(wine: Wine): string {
  return formatWineDisplayName(wine)
}

export function countShelfBottles(
  slotsByKey: Map<string, Wine[]>,
  rowNum: number,
  slotCount: number,
  maxDepth: number,
): number {
  let count = 0

  for (let column = 1; column <= slotCount; column += 1) {
    for (let depth = 1; depth <= maxDepth; depth += 1) {
      if (getWineAtSlot(slotsByKey, rowNum, column, depth)) {
        count += 1
      }
    }
  }

  return count
}

export function getFrontWine(
  slotsByKey: Map<string, Wine[]>,
  row: number,
  column: number,
): Wine | null {
  for (let depth = 1; depth <= 3; depth += 1) {
    const wines = slotsByKey.get(getSlotKey(row, column, depth))
    if (wines?.[0]) {
      return wines[0]
    }
  }

  return null
}

export function countDepthStack(
  slotsByKey: Map<string, Wine[]>,
  row: number,
  column: number,
  maxDepth = 3,
): number {
  let count = 0

  for (let depth = 1; depth <= maxDepth; depth += 1) {
    if ((slotsByKey.get(getSlotKey(row, column, depth))?.length ?? 0) > 0) {
      count += 1
    }
  }

  return count
}

export function resolveOverviewDropDepth(
  slotsByKey: Map<string, Wine[]>,
  rowNum: number,
  column: number,
  maxDepth: number,
): number {
  for (let depth = 1; depth <= maxDepth; depth += 1) {
    if (!getWineAtSlot(slotsByKey, rowNum, column, depth)) {
      return depth
    }
  }

  return 1
}

export function formatSlotMeta(wine: Wine): string {
  const parts = [wine.producer, wine.vintage === null ? null : String(wine.vintage)].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : 'Unknown producer'
}
