import { isStaticDemo } from '../config/appMode'
import { getSupabase } from '../lib/supabase'
import {
  createDemoWine,
  getDemoWines,
  resetDemoWines,
  swapDemoWineCellarPositions,
  updateDemoWineCellarPosition,
} from './staticDemoWineStore'
import type { CellarPosition } from '../types/cellar'
import type { CreateWineInput, Wine } from '../types/wine'

type WineRow = {
  id: string
  created_at: string
  name: string
  producer: string | null
  vintage: number | null
  type: string | null
  grape_variety: string | null
  region: string | null
  purchase_date: string | null
  purchase_price: number | string | null
  is_cellar: boolean | null
  cellar_zone: string | null
  row_num: number | null
  col_num: number | null
  depth_num?: number | null
  is_consumed: boolean | null
  drinking_date: string | null
  label_image_url: string | null
  tasting_notes: string | null
  rating: number | null
}

const WINE_COLUMN_LIST = [
  'id',
  'created_at',
  'name',
  'producer',
  'vintage',
  'type',
  'grape_variety',
  'region',
  'purchase_date',
  'purchase_price',
  'is_cellar',
  'cellar_zone',
  'row_num',
  'col_num',
  'depth_num',
  'is_consumed',
  'drinking_date',
  'label_image_url',
  'tasting_notes',
  'rating',
] as const

let supportsDepthNum: boolean | null = null

function isMissingDepthColumn(message: string): boolean {
  return message.includes('depth_num') && message.includes('does not exist')
}

function getSelectColumns(includeDepth: boolean): string {
  const columns = includeDepth
    ? WINE_COLUMN_LIST
    : WINE_COLUMN_LIST.filter((column) => column !== 'depth_num')

  return columns.join(',')
}

function shouldIncludeDepth(): boolean {
  return supportsDepthNum !== false
}

function toOptionalText(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function toWine(row: WineRow): Wine {
  return {
    id: row.id,
    name: row.name,
    producer: row.producer,
    vintage: row.vintage,
    type: row.type,
    variety: row.grape_variety,
    region: row.region,
    price: row.purchase_price === null ? null : Number(row.purchase_price),
    purchaseDate: row.purchase_date,
    note: row.tasting_notes,
    isCellar: row.is_cellar ?? false,
    cellarZone: row.cellar_zone,
    rowNum: row.row_num,
    colNum: row.col_num,
    depthNum: row.depth_num ?? 1,
    isConsumed: row.is_consumed ?? false,
    drinkingDate: row.drinking_date,
    labelImageUrl: row.label_image_url,
    rating: row.rating,
    createdAt: row.created_at,
  }
}

function normalizeSupabaseError(message: string): Error {
  if (message.includes('relation "public.wines" does not exist')) {
    return new Error('Supabase wines table is missing. Apply the wines migration first.')
  }

  if (message.includes('permission denied') || message.includes('row-level security')) {
    return new Error('Supabase rejected the wine request. Check authentication and RLS policies.')
  }

  return new Error(message)
}

function toPositionPayload(position: CellarPosition) {
  const payload: Record<string, unknown> = {
    is_cellar: position.isCellar,
    cellar_zone: position.cellarZone,
    row_num: position.rowNum,
    col_num: position.colNum,
  }

  if (shouldIncludeDepth()) {
    payload.depth_num = position.depthNum ?? 1
  }

  return payload
}

async function selectWines(includeDepth: boolean): Promise<Wine[]> {
  const { data, error } = await getSupabase()
    .from('wines')
    .select(getSelectColumns(includeDepth))
    .order('created_at', { ascending: false })
    .returns<WineRow[]>()

  if (error) {
    throw normalizeSupabaseError(error.message)
  }

  return (data ?? []).map(toWine)
}

export function resetWines(): void {
  if (isStaticDemo) {
    resetDemoWines()
  }
}

export async function listWines(): Promise<Wine[]> {
  if (isStaticDemo) {
    return getDemoWines()
  }

  if (supportsDepthNum === false) {
    return selectWines(false)
  }

  const { data, error } = await getSupabase()
    .from('wines')
    .select(getSelectColumns(true))
    .order('created_at', { ascending: false })
    .returns<WineRow[]>()

  if (error) {
    if (isMissingDepthColumn(error.message)) {
      supportsDepthNum = false
      return selectWines(false)
    }

    throw normalizeSupabaseError(error.message)
  }

  supportsDepthNum = true
  return (data ?? []).map(toWine)
}

export async function createWine(input: CreateWineInput): Promise<Wine> {
  if (isStaticDemo) {
    return createDemoWine(input)
  }

  const includeDepth = shouldIncludeDepth()
  const { data, error } = await getSupabase()
    .from('wines')
    .insert({
      name: input.name.trim(),
      producer: toOptionalText(input.producer),
      vintage: input.vintage ?? null,
      type: toOptionalText(input.type) ?? 'Red',
      grape_variety: toOptionalText(input.variety),
      region: toOptionalText(input.region),
      purchase_price: input.price ?? null,
      purchase_date: input.purchaseDate ?? null,
      tasting_notes: toOptionalText(input.note),
      rating: input.rating ?? null,
    })
    .select(getSelectColumns(includeDepth))
    .single()
    .returns<WineRow>()

  if (error) {
    if (includeDepth && isMissingDepthColumn(error.message)) {
      supportsDepthNum = false
      return createWine(input)
    }

    throw normalizeSupabaseError(error.message)
  }

  if (includeDepth) {
    supportsDepthNum = true
  }

  return toWine(data)
}

export async function updateWineCellarPosition(
  wineId: string,
  position: CellarPosition,
): Promise<Wine> {
  if (isStaticDemo) {
    return updateDemoWineCellarPosition(wineId, position)
  }

  const includeDepth = shouldIncludeDepth()
  const { data, error } = await getSupabase()
    .from('wines')
    .update(toPositionPayload(position))
    .eq('id', wineId)
    .select(getSelectColumns(includeDepth))
    .single()
    .returns<WineRow>()

  if (error) {
    if (includeDepth && isMissingDepthColumn(error.message)) {
      supportsDepthNum = false
      return updateWineCellarPosition(wineId, position)
    }

    throw normalizeSupabaseError(error.message)
  }

  if (includeDepth) {
    supportsDepthNum = true
  }

  return toWine(data)
}

export async function swapWineCellarPositions(wineA: Wine, wineB: Wine): Promise<[Wine, Wine]> {
  if (isStaticDemo) {
    return swapDemoWineCellarPositions(wineA, wineB)
  }

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

  const [updatedA, updatedB] = await Promise.all([
    updateWineCellarPosition(wineA.id, positionB),
    updateWineCellarPosition(wineB.id, positionA),
  ])

  return [updatedA, updatedB]
}
