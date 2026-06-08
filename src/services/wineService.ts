import { supabase } from '../lib/supabase'
import type { CreateWineInput, Wine } from '../types/wine'

type WineRow = {
  id: string
  owner_id: string
  name: string
  producer: string | null
  vintage: number | null
  variety: string | null
  price: number | string | null
  purchase_date: string | null
  note: string | null
  created_at: string
  updated_at: string
}

const wineColumns = [
  'id',
  'owner_id',
  'name',
  'producer',
  'vintage',
  'variety',
  'price',
  'purchase_date',
  'note',
  'created_at',
  'updated_at',
].join(',')

function toOptionalText(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function toWine(row: WineRow): Wine {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    producer: row.producer,
    vintage: row.vintage,
    variety: row.variety,
    price: row.price === null ? null : Number(row.price),
    purchaseDate: row.purchase_date,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw normalizeSupabaseError(userError.message)
  }

  if (!user) {
    throw new Error('Sign in before saving wine data. Owner-scoped RLS requires an authenticated user.')
  }

  const { data, error } = await supabase
    .from('wines')
    .insert({
      owner_id: user.id,
      name: input.name.trim(),
      producer: toOptionalText(input.producer),
      vintage: input.vintage ?? null,
      variety: toOptionalText(input.variety),
      price: input.price ?? null,
      purchase_date: input.purchaseDate ?? null,
      note: toOptionalText(input.note),
    })
    .select(wineColumns)
    .single()
    .returns<WineRow>()

  if (error) {
    throw normalizeSupabaseError(error.message)
  }

  return toWine(data)
}
