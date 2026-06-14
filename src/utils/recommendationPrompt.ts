import type { Wine } from '../types/wine'

type InventorySnapshot = {
  id: string
  name: string
  producer: string | null
  vintage: number | null
  type: string | null
  variety: string | null
  region: string | null
  price: number | null
  purchaseDate: string | null
  note: string | null
  rating: number | null
  isCellar: boolean
  cellarZone: string | null
  rowNum: number | null
  colNum: number | null
  depthNum: number | null
  isConsumed: boolean
  drinkingDate: string | null
}

function toInventorySnapshot(wine: Wine): InventorySnapshot {
  return {
    id: wine.id,
    name: wine.name,
    producer: wine.producer,
    vintage: wine.vintage,
    type: wine.type,
    variety: wine.variety,
    region: wine.region,
    price: wine.price,
    purchaseDate: wine.purchaseDate,
    note: wine.note,
    rating: wine.rating,
    isCellar: wine.isCellar,
    cellarZone: wine.cellarZone,
    rowNum: wine.rowNum,
    colNum: wine.colNum,
    depthNum: wine.depthNum,
    isConsumed: wine.isConsumed,
    drinkingDate: wine.drinkingDate,
  }
}

export function buildRecommendationPrompt(wines: Wine[], userQuery: string): string {
  const availableWines = wines.filter((wine) => !wine.isConsumed)
  const inventoryJson = JSON.stringify(availableWines.map(toInventorySnapshot), null, 2)

  return `You are an expert sommelier helping a home collector decide what to drink next.

Use only the wines in the inventory below. Do not invent bottles that are not listed.
Prefer wines that match the user's request. If nothing fits well, return an empty recommendations array and explain why in summary.
Respond in Korean.

Inventory JSON:
${inventoryJson}

User request:
${userQuery.trim()}

Return JSON only with this exact shape:
{
  "recommendations": [
    {
      "wineId": "uuid from inventory",
      "wineName": "wine name",
      "reason": "why this wine fits the request",
      "urgency": "high" | "medium" | "low"
    }
  ],
  "summary": "short overall answer"
}

Rules:
- Include up to 3 recommendations, ordered by best fit.
- wineId must come from the inventory.
- urgency reflects how soon the user should drink the bottle when relevant.
- If the user asks about aging windows, drinking windows, or urgency, use vintage, type, variety, notes, and purchase date as signals.
- Never recommend consumed wines.`
}
