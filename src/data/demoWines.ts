import seedRows from '../../supabase/seed-wines.json'
import type { Wine } from '../types/wine'

type SeedWineRow = {
  id: string
  name: string
  producer: string | null
  vintage: number | null
  type: string | null
  grape_variety: string | null
  region: string | null
  purchase_date: string | null
  purchase_price: number | null
  is_cellar: boolean
  cellar_zone: string | null
  row_num: number | null
  col_num: number | null
  depth_num?: number | null
  is_consumed: boolean
  drinking_date?: string | null
  label_image_url?: string | null
  tasting_notes: string | null
  rating?: number | null
}

function toWine(row: SeedWineRow, index: number): Wine {
  return {
    id: row.id,
    name: row.name,
    producer: row.producer,
    vintage: row.vintage,
    type: row.type,
    variety: row.grape_variety,
    region: row.region,
    price: row.purchase_price,
    purchaseDate: row.purchase_date,
    note: row.tasting_notes,
    isCellar: row.is_cellar,
    cellarZone: row.cellar_zone,
    rowNum: row.row_num,
    colNum: row.col_num,
    depthNum: row.depth_num ?? 1,
    isConsumed: row.is_consumed,
    drinkingDate: row.drinking_date ?? null,
    labelImageUrl: row.label_image_url ?? null,
    rating: row.rating ?? null,
    createdAt: `2026-03-28T00:00:${String(index).padStart(2, '0')}.000Z`,
  }
}

export function getInitialDemoWines(): Wine[] {
  return (seedRows as SeedWineRow[]).map(toWine)
}
