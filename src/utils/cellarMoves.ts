import {
  OUTSIDE_CELLAR_POSITION,
  cellarSlotPosition,
  type CellarMoveTarget,
} from '../types/cellar'
import type { Wine } from '../types/wine'
import { getSlotKey } from './cellarVisual'

function isSameSlot(a: Wine, row: number, column: number, depth: number): boolean {
  return a.isCellar && a.rowNum === row && a.colNum === column && (a.depthNum ?? 1) === depth
}

function withPosition(wine: Wine, position: ReturnType<typeof cellarSlotPosition>): Wine {
  return {
    ...wine,
    isCellar: position.isCellar,
    cellarZone: position.cellarZone,
    rowNum: position.rowNum,
    colNum: position.colNum,
    depthNum: position.depthNum,
  }
}

export function applyCellarMove(
  wines: Wine[],
  sourceWineId: string,
  target: CellarMoveTarget,
): Wine[] {
  const sourceWine = wines.find((wine) => wine.id === sourceWineId)
  if (!sourceWine) {
    return wines
  }

  if (target.type === 'outside') {
    return wines.map((wine) =>
      wine.id === sourceWineId ? withPosition(wine, OUTSIDE_CELLAR_POSITION) : wine,
    )
  }

  const targetDepth = target.depth ?? 1
  const targetPosition = cellarSlotPosition(
    target.row,
    target.column,
    target.zone,
    targetDepth,
  )
  const occupant = wines.find(
    (wine) =>
      wine.id !== sourceWineId &&
      isSameSlot(wine, target.row, target.column, targetDepth),
  )

  if (!occupant) {
    return wines.map((wine) =>
      wine.id === sourceWineId ? withPosition(wine, targetPosition) : wine,
    )
  }

  const sourcePosition = {
    isCellar: sourceWine.isCellar,
    cellarZone: sourceWine.cellarZone,
    rowNum: sourceWine.rowNum,
    colNum: sourceWine.colNum,
    depthNum: sourceWine.depthNum ?? 1,
  }

  return wines.map((wine) => {
    if (wine.id === sourceWineId) {
      return withPosition(wine, targetPosition)
    }

    if (wine.id === occupant.id) {
      if (
        sourcePosition.isCellar &&
        sourcePosition.rowNum !== null &&
        sourcePosition.colNum !== null
      ) {
        return withPosition(
          wine,
          cellarSlotPosition(
            sourcePosition.rowNum,
            sourcePosition.colNum,
            sourcePosition.cellarZone ?? 'A',
            sourcePosition.depthNum,
          ),
        )
      }

      return withPosition(wine, OUTSIDE_CELLAR_POSITION)
    }

    return wine
  })
}

export { getSlotKey }
