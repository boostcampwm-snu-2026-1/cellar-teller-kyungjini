import { useState } from 'react'
import { isStaticDemo } from '../config/appMode'
import { requestWineRecommendation } from '../services/recommendationService'
import { formatWineDisplayName } from '../utils/wineDisplay'
import type { RecommendationResponse, WineRecommendation } from '../types/recommendation'
import type { Wine } from '../types/wine'

const EXAMPLE_PROMPTS = [
  '시음 적기가 얼마 안 남은 와인을 알려줘',
  '빨리 마셔야 할 와인을 추천해줘',
  '스테이크 디너에 같이 마실 와인을 추천해줘',
  '가벼운 화이트 와인 하나 골라줘',
]

type RecommendationViewProps = {
  wines: Wine[]
  onSelectWine: (wineId: string) => void
}

export function RecommendationView({ wines, onSelectWine }: RecommendationViewProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [result, setResult] = useState<RecommendationResponse | null>(null)

  async function handleSubmit() {
    setStatus('loading')
    setErrorMessage(null)

    try {
      const recommendation = await requestWineRecommendation(wines, query)
      setResult(recommendation)
      setStatus('ready')
    } catch (error) {
      setResult(null)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to get recommendations.')
    }
  }

  return (
    <section className="recommendation-view" aria-labelledby="recommendation-title">
      <div className="recommendation-header">
        <div>
          <p className="eyebrow">Sommelier</p>
          <h2 id="recommendation-title">오늘 어떤 와인을 마실까요?</h2>
          <p className="subtitle">
            {isStaticDemo
              ? '자연어로 요청하면 미리 준비된 샘플 추천을 보여줍니다.'
              : '자연어로 요청하면 Gemini가 현재 인벤토리를 읽고 열어볼 와인을 추천합니다.'}
          </p>
        </div>
      </div>

      <label className="recommendation-query">
        <span>추천 요청</span>
        <textarea
          rows={4}
          value={query}
          placeholder='예: "시음 적기가 얼마 안 남은 와인을 알려줘"'
          onChange={(event) => {
            setQuery(event.target.value)
          }}
        />
      </label>

      <div className="example-prompts" aria-label="Example prompts">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="example-prompt"
            onClick={() => {
              setQuery(prompt)
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="recommendation-actions">
        <button
          type="button"
          className="refresh-button"
          disabled={status === 'loading' || query.trim().length === 0}
          onClick={() => {
            void handleSubmit()
          }}
        >
          {status === 'loading'
            ? isStaticDemo
              ? '샘플 추천을 준비하는 중...'
              : 'Gemini에 물어보는 중...'
            : '추천 받기'}
        </button>
      </div>

      {status === 'error' && errorMessage && (
        <p className="form-message error-message" role="alert">
          {errorMessage}
        </p>
      )}

      {status === 'ready' && result && (
        <section className="recommendation-result" aria-live="polite">
          <p className="recommendation-summary">{result.summary}</p>

          {result.recommendations.length === 0 ? (
            <p className="empty-inline">인벤토리에서 조건에 맞는 와인을 찾지 못했습니다.</p>
          ) : (
            <div className="recommendation-list">
              {result.recommendations.map((item) => (
                <article className="recommendation-card" key={`${item.wineId}-${item.wineName}`}>
                  <div className="recommendation-card-header">
                    <div>
                      <p className="eyebrow">추천 와인</p>
                      <h3>{formatRecommendationName(item, wines)}</h3>
                    </div>
                    <span className={`urgency-badge urgency-${item.urgency}`}>
                      {formatUrgencyLabel(item.urgency)}
                    </span>
                  </div>
                  <p>{item.reason}</p>
                  <button
                    type="button"
                    className="detail-button"
                    onClick={() => {
                      onSelectWine(item.wineId)
                    }}
                  >
                    와인 상세 보기
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  )
}

function formatUrgencyLabel(urgency: WineRecommendation['urgency']): string {
  switch (urgency) {
    case 'high':
      return '높음'
    case 'medium':
      return '보통'
    case 'low':
      return '낮음'
  }
}

function formatRecommendationName(item: WineRecommendation, wines: Wine[]): string {
  const wine = wines.find((entry) => entry.id === item.wineId)
  if (wine) {
    return formatWineDisplayName(wine)
  }

  return item.wineName
}
