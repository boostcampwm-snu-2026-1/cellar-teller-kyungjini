import type { RecommendationResponse } from '../types/recommendation'

const DRINK_SOON_RESPONSE: RecommendationResponse = {
  summary:
    '몇몇 셀러 와인이 마시기 좋은 시점에 들어왔습니다. 새 병을 더 넣기 전에 오래된 빈티지와 가볍게 열기 좋은 병을 먼저 확인하세요.',
  recommendations: [
    {
      wineId: '00000000-0000-4000-8000-000000000005',
      wineName: 'Château Croizet-Bages 2019',
      reason:
        '2019 빈티지는 구조감이 남아 있으면서도 지금 편하게 열어 마시기 좋은 단계입니다.',
      urgency: 'high',
    },
    {
      wineId: '00000000-0000-4000-8000-000000000004',
      wineName: 'Giesen Small Batch Pinot Noir 2022',
      reason:
        '장기 보관보다 지금 즐기기 좋은 가벼운 레드 와인입니다.',
      urgency: 'medium',
    },
    {
      wineId: '00000000-0000-4000-8000-000000000001',
      wineName: 'Château La Rabotine, Sancerre ADP 2023',
      reason:
        '상큼한 향과 산도가 살아 있을 때 마시기 좋은 신선한 화이트 와인입니다.',
      urgency: 'medium',
    },
  ],
}

const STEAK_RESPONSE: RecommendationResponse = {
  summary:
    '스테이크 디너에는 구운 풍미와 기름진 질감을 받아줄 수 있는 구조감 있는 레드 와인이 좋습니다.',
  recommendations: [
    {
      wineId: '00000000-0000-4000-8000-000000000005',
      wineName: 'Château Croizet-Bages 2019',
      reason:
        '탄닌과 깊이가 있는 클래식 보르도 스타일이라 구운 소고기와 잘 어울립니다.',
      urgency: 'medium',
    },
    {
      wineId: '00000000-0000-4000-8000-000000000003',
      wineName: 'Bread & Butter Pinot Noir 2024',
      reason:
        '부드럽고 과실감이 있는 레드를 원할 때 부담 없이 선택하기 좋습니다.',
      urgency: 'low',
    },
  ],
}

const WHITE_RESPONSE: RecommendationResponse = {
  summary: '지금은 셀러와 외부 보관 와인 중 산뜻하고 가벼운 화이트가 가장 잘 맞습니다.',
  recommendations: [
    {
      wineId: '00000000-0000-4000-8000-000000000001',
      wineName: 'Château La Rabotine, Sancerre ADP 2023',
      reason: '밝은 산도와 깔끔한 피니시가 있는 미네랄 중심의 루아르 화이트입니다.',
      urgency: 'medium',
    },
    {
      wineId: '00000000-0000-4000-8000-000000000002',
      wineName: 'Pouilly-Fuissé ADP 2024',
      reason: '둥근 질감이 있어 편하게 마시기 좋은 부르고뉴 화이트입니다.',
      urgency: 'low',
    },
  ],
}

const DEFAULT_RESPONSE: RecommendationResponse = {
  summary:
    '현재 인벤토리를 기준으로 마시기 좋은 시점, 스타일, 다양성을 함께 고려하면 다음 병들이 좋습니다.',
  recommendations: [
    {
      wineId: '00000000-0000-4000-8000-000000000005',
      wineName: 'Château Croizet-Bages 2019',
      reason: '저녁 식사와 두루 잘 맞고 추가 숙성이 꼭 필요하지 않은 레드입니다.',
      urgency: 'medium',
    },
    {
      wineId: '00000000-0000-4000-8000-000000000001',
      wineName: 'Château La Rabotine, Sancerre ADP 2023',
      reason: '가볍고 산뜻한 와인이 필요할 때 좋은 화이트 선택지입니다.',
      urgency: 'low',
    },
    {
      wineId: '00000000-0000-4000-8000-000000000004',
      wineName: 'Giesen Small Batch Pinot Noir 2022',
      reason: '캐주얼하게 열기 좋으면서도 충분히 매력적인 피노 누아입니다.',
      urgency: 'low',
    },
  ],
}

function matchesAny(query: string, keywords: string[]): boolean {
  const normalized = query.toLowerCase()
  return keywords.some((keyword) => normalized.includes(keyword))
}

export function getMockRecommendation(query: string): RecommendationResponse {
  if (matchesAny(query, ['스테이크', 'steak', '고기', '디너'])) {
    return STEAK_RESPONSE
  }

  if (matchesAny(query, ['화이트', 'white', '가벼운', '가벼운 화이트'])) {
    return WHITE_RESPONSE
  }

  if (
    matchesAny(query, [
      '시음 적기',
      '빨리',
      '마셔야',
      'drink soon',
      'aging',
      '적기',
    ])
  ) {
    return DRINK_SOON_RESPONSE
  }

  return DEFAULT_RESPONSE
}
