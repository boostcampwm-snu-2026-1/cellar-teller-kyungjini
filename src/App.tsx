import { useEffect, useState } from 'react'
import './App.css'
import { listWines } from './services/wineService'
import type { Wine } from './types/wine'

function App() {
  const [wines, setWines] = useState<Wine[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function loadWines() {
    setStatus('loading')
    setErrorMessage(null)

    try {
      const loadedWines = await listWines()
      setWines(loadedWines)
      setStatus('ready')
    } catch (error) {
      setWines([])
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load wines.')
    }
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialWines() {
      try {
        const loadedWines = await listWines()

        if (!ignore) {
          setWines(loadedWines)
          setStatus('ready')
        }
      } catch (error) {
        if (!ignore) {
          setWines([])
          setStatus('error')
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load wines.')
        }
      }
    }

    void loadInitialWines()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <main className="inventory-page">
      <header className="inventory-header">
        <div>
          <p className="eyebrow">Cellar Teller</p>
          <h1>Wine inventory</h1>
          <p className="subtitle">Supabase에서 불러온 와인 목록입니다.</p>
        </div>
        <button type="button" className="refresh-button" onClick={loadWines}>
          Refresh
        </button>
      </header>

      {status === 'loading' && <p className="state-message">Loading wines...</p>}

      {status === 'error' && (
        <section className="state-message error-state" aria-live="polite">
          <strong>Unable to load wine list</strong>
          <span>{errorMessage}</span>
        </section>
      )}

      {status === 'ready' && wines.length === 0 && (
        <section className="empty-state" aria-live="polite">
          <h2>No wines yet</h2>
          <p>
            Apply the Supabase wines migration, sign in once auth UI is available, then add a
            wine to see it here.
          </p>
        </section>
      )}

      {status === 'ready' && wines.length > 0 && (
        <section className="wine-list" aria-label="Wine list">
          {wines.map((wine) => (
            <article className="wine-card" key={wine.id}>
              <div>
                <h2>{wine.name}</h2>
                <p>{wine.producer ?? 'Unknown producer'}</p>
              </div>
              <dl>
                <div>
                  <dt>Vintage</dt>
                  <dd>{wine.vintage ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt>Variety</dt>
                  <dd>{wine.variety ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt>Price</dt>
                  <dd>{wine.price === null ? 'N/A' : `$${wine.price.toFixed(2)}`}</dd>
                </div>
              </dl>
              <p className="wine-meta">
                {wine.type ?? 'Unknown type'}
                {wine.region ? ` · ${wine.region}` : ''}
                {wine.isConsumed ? ' · Consumed' : ''}
              </p>
              {wine.note && <p className="wine-note">{wine.note}</p>}
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default App
