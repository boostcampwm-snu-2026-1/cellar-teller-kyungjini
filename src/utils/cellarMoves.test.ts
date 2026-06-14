import { describe, expect, it } from 'vitest'
import { applyCellarMove } from './cellarMoves'
import type { Wine } from '../types/wine'

const baseWine: Wine = {
  id: 'wine-1',
  name: 'Ridge Estate',
  producer: 'Ridge Vineyards',
  vintage: 2021,
  type: 'Red',
  variety: 'Cabernet Sauvignon',
  region: 'Santa Cruz Mountains',
  price: 45,
  purchaseDate: '2026-06-09',
  note: null,
  isCellar: false,
  cellarZone: null,
  rowNum: null,
  colNum: null,
  depthNum: null,
  isConsumed: false,
  drinkingDate: null,
  labelImageUrl: null,
  rating: 4,
  createdAt: '2026-06-09T00:00:00.000Z',
}

const cellarWine: Wine = {
  ...baseWine,
  id: 'wine-2',
  name: 'Cellar Bottle',
  isCellar: true,
  cellarZone: 'A',
  rowNum: 2,
  colNum: 3,
  depthNum: 1,
}

describe('applyCellarMove', () => {
  it('moves an outside bottle into an empty cellar slot', () => {
    const result = applyCellarMove([baseWine], baseWine.id, {
      type: 'slot',
      row: 1,
      column: 1,
      depth: 1,
    })

    expect(result[0]).toMatchObject({
      isCellar: true,
      cellarZone: 'A',
      rowNum: 1,
      colNum: 1,
      depthNum: 1,
    })
  })

  it('swaps two cellar bottles when dropping onto an occupied slot', () => {
    const outsideWine = { ...baseWine, id: 'wine-3', name: 'Outside Bottle' }
    const result = applyCellarMove(
      [cellarWine, outsideWine],
      outsideWine.id,
      { type: 'slot', row: 2, column: 3, depth: 1 },
    )

    expect(result.find((wine) => wine.id === outsideWine.id)).toMatchObject({
      rowNum: 2,
      colNum: 3,
      depthNum: 1,
      isCellar: true,
    })
    expect(result.find((wine) => wine.id === cellarWine.id)).toMatchObject({
      isCellar: false,
      rowNum: null,
      colNum: null,
      depthNum: null,
    })
  })

  it('moves a cellar bottle to outside storage', () => {
    const result = applyCellarMove([cellarWine], cellarWine.id, { type: 'outside' })

    expect(result[0]).toMatchObject({
      isCellar: false,
      cellarZone: null,
      rowNum: null,
      colNum: null,
      depthNum: null,
    })
  })
})
