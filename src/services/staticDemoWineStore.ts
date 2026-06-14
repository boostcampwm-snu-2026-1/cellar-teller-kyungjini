import { getInitialDemoWines } from '../data/demoWines'
import type { CellarPosition } from '../types/cellar'
import type { CreateWineInput, Wine } from '../types/wine'

let wines = getInitialDemoWines()

function cloneWine(wine: Wine): Wine {
  return { ...wine }
}

function cloneWines(): Wine[] {
  return wines.map(cloneWine)
}

export function resetDemoWines(): void {
  wines = getInitialDemoWines()
}

export function getDemoWines(): Wine[] {
  return cloneWines()
}

export function createDemoWine(input: CreateWineInput): Wine {
  const wine: Wine = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    producer: input.producer?.trim() || null,
    vintage: input.vintage ?? null,
    type: input.type?.trim() || 'Red',
    variety: input.variety?.trim() || null,
    region: input.region?.trim() || null,
    price: input.price ?? null,
    purchaseDate: input.purchaseDate ?? null,
    note: input.note?.trim() || null,
    isCellar: false,
    cellarZone: null,
    rowNum: null,
    colNum: null,
    depthNum: 1,
    isConsumed: false,
    drinkingDate: null,
    labelImageUrl: null,
    rating: input.rating ?? null,
    createdAt: new Date().toISOString(),
  }

  wines = [wine, ...wines]
  return cloneWine(wine)
}

function updateWineById(wineId: string, updater: (wine: Wine) => Wine): Wine {
  const index = wines.findIndex((wine) => wine.id === wineId)

  if (index === -1) {
    throw new Error('Wine not found in demo inventory.')
  }

  const updatedWine = updater(wines[index])
  wines = [...wines.slice(0, index), updatedWine, ...wines.slice(index + 1)]
  return cloneWine(updatedWine)
}

export function updateDemoWineCellarPosition(
  wineId: string,
  position: CellarPosition,
): Wine {
  return updateWineById(wineId, (wine) => ({
    ...wine,
    isCellar: position.isCellar,
    cellarZone: position.cellarZone,
    rowNum: position.rowNum,
    colNum: position.colNum,
    depthNum: position.depthNum ?? 1,
  }))
}

export function swapDemoWineCellarPositions(wineA: Wine, wineB: Wine): [Wine, Wine] {
  const positionA: CellarPosition = {
    isCellar: wineA.isCellar,
    cellarZone: wineA.cellarZone,
    rowNum: wineA.rowNum,
    colNum: wineA.colNum,
    depthNum: wineA.depthNum,
  }
  const positionB: CellarPosition = {
    isCellar: wineB.isCellar,
    cellarZone: wineB.cellarZone,
    rowNum: wineB.rowNum,
    colNum: wineB.colNum,
    depthNum: wineB.depthNum,
  }

  const updatedA = updateDemoWineCellarPosition(wineA.id, positionB)
  const updatedB = updateDemoWineCellarPosition(wineB.id, positionA)
  return [updatedA, updatedB]
}
