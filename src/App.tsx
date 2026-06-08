import { useEffect, useState } from 'react'
import './App.css'
import { createWine, listWines } from './services/wineService'
import type { FormEvent } from 'react'
import type { Wine } from './types/wine'

function App() {
  const [wines, setWines] = useState<Wine[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

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

  async function handleCreateWine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const form = event.currentTarget
    const name = String(formData.get('name') ?? '').trim()

    if (!name) {
      setSaveMessage('Wine name is required.')
      return
    }

    setSaveStatus('saving')
    setSaveMessage(null)

    try {
      await createWine({
        name,
        producer: String(formData.get('producer') ?? ''),
        vintage: toOptionalNumber(formData.get('vintage')),
        type: String(formData.get('type') ?? ''),
        variety: String(formData.get('variety') ?? ''),
        region: String(formData.get('region') ?? ''),
        price: toOptionalNumber(formData.get('price')),
        purchaseDate: String(formData.get('purchaseDate') ?? '') || undefined,
        note: String(formData.get('note') ?? ''),
        rating: toOptionalNumber(formData.get('rating')),
      })

      form.reset()
      setSaveMessage('Wine saved.')
      await loadWines()
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Failed to save wine.')
    } finally {
      setSaveStatus('idle')
    }
  }

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

      <section className="wine-form-panel" aria-labelledby="wine-form-title">
        <h2 id="wine-form-title">Add wine</h2>
        <form className="wine-form" onSubmit={handleCreateWine}>
          <label>
            <span>Name</span>
            <input name="name" required placeholder="Chateau Margaux" />
          </label>
          <label>
            <span>Producer</span>
            <input name="producer" placeholder="Winery or producer" />
          </label>
          <label>
            <span>Vintage</span>
            <input name="vintage" type="number" min="1800" max="2200" placeholder="2020" />
          </label>
          <label>
            <span>Type</span>
            <select name="type" defaultValue="Red">
              <option>Red</option>
              <option>White</option>
              <option>Sparkling</option>
              <option>Rose</option>
              <option>Dessert</option>
              <option>Fortified</option>
            </select>
          </label>
          <label>
            <span>Grape</span>
            <input name="variety" placeholder="Pinot Noir" />
          </label>
          <label>
            <span>Region</span>
            <input name="region" placeholder="Burgundy, France" />
          </label>
          <label>
            <span>Purchase date</span>
            <input name="purchaseDate" type="date" />
          </label>
          <label>
            <span>Price</span>
            <input name="price" type="number" min="0" step="0.01" placeholder="45.00" />
          </label>
          <label>
            <span>Rating</span>
            <input name="rating" type="number" min="1" max="5" placeholder="4" />
          </label>
          <label className="wide-field">
            <span>Notes</span>
            <textarea name="note" rows={3} placeholder="Tasting notes or storage memo" />
          </label>
          <div className="form-actions">
            <button type="submit" className="refresh-button" disabled={saveStatus === 'saving'}>
              {saveStatus === 'saving' ? 'Saving...' : 'Save wine'}
            </button>
            {saveMessage && <p className="form-message">{saveMessage}</p>}
          </div>
        </form>
      </section>

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

function toOptionalNumber(value: FormDataEntryValue | null): number | undefined {
  const text = String(value ?? '').trim()

  if (!text) {
    return undefined
  }

  const number = Number(text)
  return Number.isFinite(number) ? number : undefined
}

export default App
