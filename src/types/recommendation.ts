export type WineRecommendation = {
  wineId: string
  wineName: string
  reason: string
  urgency: 'high' | 'medium' | 'low'
}

export type RecommendationResponse = {
  recommendations: WineRecommendation[]
  summary: string
}
