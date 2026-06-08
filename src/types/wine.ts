export type Wine = {
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
  isCellar: boolean
  cellarZone: string | null
  rowNum: number | null
  colNum: number | null
  isConsumed: boolean
  drinkingDate: string | null
  labelImageUrl: string | null
  rating: number | null
  createdAt: string
}

export type CreateWineInput = {
  name: string
  producer?: string
  vintage?: number
  type?: string
  variety?: string
  region?: string
  price?: number
  purchaseDate?: string
  note?: string
  rating?: number
}

export type UpdateWineInput = Partial<CreateWineInput>
