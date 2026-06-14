export type CellarPosition = {
  isCellar: boolean
  cellarZone: string | null
  rowNum: number | null
  colNum: number | null
  depthNum: number | null
}

export type CellarMoveTarget =
  | { type: 'slot'; row: number; column: number; depth?: number; zone?: string }
  | { type: 'outside' }

export const OUTSIDE_CELLAR_POSITION: CellarPosition = {
  isCellar: false,
  cellarZone: null,
  rowNum: null,
  colNum: null,
  depthNum: null,
}

export function cellarSlotPosition(
  row: number,
  column: number,
  zone = 'A',
  depth = 1,
): CellarPosition {
  return {
    isCellar: true,
    cellarZone: zone,
    rowNum: row,
    colNum: column,
    depthNum: depth,
  }
}
