export type CellarShelfConfig = {
  label: string
  rowNum: number
  slotCount: number
  maxDepth: number
}

export const CELLAR_ZONE = 'A'
export const SLOTS_PER_LAYER = 8

export const CELLAR_SHELVES: CellarShelfConfig[] = [
  { label: 'T5', rowNum: 1, slotCount: SLOTS_PER_LAYER, maxDepth: 3 },
  { label: 'T4', rowNum: 2, slotCount: SLOTS_PER_LAYER, maxDepth: 1 },
  { label: 'T3', rowNum: 3, slotCount: SLOTS_PER_LAYER, maxDepth: 1 },
  { label: 'T2', rowNum: 4, slotCount: SLOTS_PER_LAYER, maxDepth: 3 },
  { label: 'T1', rowNum: 5, slotCount: SLOTS_PER_LAYER, maxDepth: 1 },
  { label: 'B1', rowNum: 6, slotCount: SLOTS_PER_LAYER, maxDepth: 3 },
  { label: 'B2', rowNum: 7, slotCount: SLOTS_PER_LAYER, maxDepth: 1 },
]

export const DEPTH_LABELS = ['Front', 'Middle', 'Back'] as const

export function getShelfByRowNum(rowNum: number): CellarShelfConfig | undefined {
  return CELLAR_SHELVES.find((shelf) => shelf.rowNum === rowNum)
}

export function getShelfByLabel(label: string): CellarShelfConfig | undefined {
  return CELLAR_SHELVES.find((shelf) => shelf.label === label)
}
