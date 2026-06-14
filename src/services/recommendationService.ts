import { isStaticDemo } from '../config/appMode'
import { getMockRecommendation } from '../data/mockRecommendations'
import type { RecommendationResponse } from '../types/recommendation'
import type { Wine } from '../types/wine'
import { buildRecommendationPrompt } from '../utils/recommendationPrompt'

const GEMINI_MODEL = 'gemini-2.5-flash-lite'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
  error?: {
    message?: string
  }
}

function getGeminiApiKey(): string {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim()

  if (!apiKey) {
    throw new Error(
      'Gemini API 키가 없습니다. .env 파일에 VITE_GEMINI_API_KEY를 추가하세요.',
    )
  }

  return apiKey
}

function extractResponseText(payload: GeminiResponse): string {
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

  if (!text) {
    throw new Error(payload.error?.message ?? 'Gemini가 빈 추천 응답을 반환했습니다.')
  }

  return text
}

function parseRecommendationResponse(rawText: string): RecommendationResponse {
  const jsonText = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()

  let parsed: unknown

  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('Gemini 응답을 JSON으로 파싱할 수 없습니다.')
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('summary' in parsed) ||
    typeof parsed.summary !== 'string' ||
    !('recommendations' in parsed) ||
    !Array.isArray(parsed.recommendations)
  ) {
    throw new Error('Gemini가 예상과 다른 추천 JSON 형식을 반환했습니다.')
  }

  const recommendations = parsed.recommendations
    .filter(
      (item): item is RecommendationResponse['recommendations'][number] =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.wineId === 'string' &&
        typeof item.wineName === 'string' &&
        typeof item.reason === 'string' &&
        (item.urgency === 'high' || item.urgency === 'medium' || item.urgency === 'low'),
    )
    .slice(0, 3)

  return {
    recommendations,
    summary: parsed.summary.trim(),
  }
}

export async function requestWineRecommendation(
  wines: Wine[],
  userQuery: string,
): Promise<RecommendationResponse> {
  const trimmedQuery = userQuery.trim()

  if (!trimmedQuery) {
    throw new Error('추천 요청을 먼저 입력하세요.')
  }

  const availableWines = wines.filter((wine) => !wine.isConsumed)

  if (availableWines.length === 0) {
    return {
      recommendations: [],
      summary: '추천할 수 있는 보유 와인이 없습니다.',
    }
  }

  if (isStaticDemo) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 700)
    })
    return getMockRecommendation(trimmedQuery)
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${getGeminiApiKey()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: buildRecommendationPrompt(availableWines, trimmedQuery) }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    }),
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as GeminiResponse | null
    throw new Error(errorBody?.error?.message ?? `Gemini 요청이 실패했습니다. 상태 코드: ${response.status}.`)
  }

  const payload = (await response.json()) as GeminiResponse
  return parseRecommendationResponse(extractResponseText(payload))
}
