import { supabase } from '../lib/supabase'
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
  is_consumed: boolean | null
  drinking_date: string | null
  label_image_url: string | null
  tasting_notes: string | null
  rating: number | null
}

const wineColumns = [
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
  'is_consumed',
  'drinking_date',
  'label_image_url',
  'tasting_notes',
  'rating',
].join(',')

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

export async function listWines(): Promise<Wine[]> {
  const { data, error } = await supabase
    .from('wines')
    .select(wineColumns)
    .order('created_at', { ascending: false })
    .returns<WineRow[]>()

  if (error) {
    throw normalizeSupabaseError(error.message)
  }

  return (data ?? []).map(toWine)
}

export async function createWine(input: CreateWineInput): Promise<Wine> {
  const { data, error } = await supabase
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
    .select(wineColumns)
    .single()
    .returns<WineRow>()

  if (error) {
    throw normalizeSupabaseError(error.message)
  }

  return toWine(data)
}
