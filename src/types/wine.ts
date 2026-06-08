export type Wine = {
  id: string
  ownerId: string
  name: string
  producer: string | null
  vintage: number | null
  variety: string | null
  price: number | null
  purchaseDate: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export type CreateWineInput = {
  name: string
  producer?: string
  vintage?: number
  variety?: string
  price?: number
  purchaseDate?: string
  note?: string
}

export type UpdateWineInput = Partial<CreateWineInput>
