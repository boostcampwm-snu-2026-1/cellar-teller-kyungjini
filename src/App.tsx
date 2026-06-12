import { useEffect, useState } from 'react'
import './App.css'
import { CellarView } from './components/CellarView'
import { createWine, listWines } from './services/wineService'
import { buildCreateWineInput } from './utils/wineFormValidation'
import type { FormEvent } from 'react'
import type { Wine } from './types/wine'

type AppView = 'inventory' | 'cellar'

function App() {
  const [wines, setWines] = useState<Wine[]>([])
  const [currentView, setCurrentView] = useState<AppView>('inventory')
  const [selectedWineId, setSelectedWineId] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveMessageType, setSaveMessageType] = useState<'status' | 'error'>('status')
  const selectedWine = selectedWineId
    ? (wines.find((wine) => wine.id === selectedWineId) ?? null)
    : null

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
    const validation = buildCreateWineInput(formData)

    if (!validation.ok) {
      setSaveMessage(validation.errors.join(' '))
      setSaveMessageType('error')
      return
    }

    setSaveStatus('saving')
    setSaveMessage(null)

    try {
      await createWine(validation.input)

      form.reset()
      setSaveMessage('Wine saved.')
      setSaveMessageType('status')
      await loadWines()
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Failed to save wine.')
      setSaveMessageType('error')
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
        <div className="header-actions">
          <nav className="view-tabs" aria-label="Main views">
            <button
              type="button"
              className={currentView === 'inventory' ? 'active' : ''}
              aria-pressed={currentView === 'inventory'}
              onClick={() => {
                setCurrentView('inventory')
                setSelectedWineId(null)
              }}
            >
              Inventory
            </button>
            <button
              type="button"
              className={currentView === 'cellar' ? 'active' : ''}
              aria-pressed={currentView === 'cellar'}
              onClick={() => {
                setCurrentView('cellar')
                setSelectedWineId(null)
              }}
            >
              Cellar
            </button>
          </nav>
          <button type="button" className="refresh-button" onClick={loadWines}>
            Refresh
          </button>
        </div>
      </header>

      {status === 'loading' && <p className="state-message">Loading wines...</p>}

      {status === 'error' && (
        <section className="state-message error-state" aria-live="polite">
          <strong>Unable to load wine list</strong>
          <span>{errorMessage}</span>
        </section>
      )}

      {status === 'ready' && selectedWineId && (
        <WineDetail
          backLabel={currentView === 'cellar' ? 'Back to cellar' : 'Back to wine list'}
          wine={selectedWine}
          onBack={() => {
            setSelectedWineId(null)
          }}
        />
      )}

      {status === 'ready' && !selectedWineId && currentView === 'inventory' && (
        <>
          <section className="wine-form-panel" aria-labelledby="wine-form-title">
            <h2 id="wine-form-title">Add wine</h2>
            <form className="wine-form" noValidate onSubmit={handleCreateWine}>
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
                {saveMessage && (
                  <p
                    className={`form-message ${
                      saveMessageType === 'error' ? 'error-message' : ''
                    }`}
                    role={saveMessageType === 'error' ? 'alert' : 'status'}
                  >
                    {saveMessage}
                  </p>
                )}
              </div>
            </form>
          </section>

          {wines.length === 0 && (
            <section className="empty-state" aria-live="polite">
              <h2>No wines yet</h2>
              <p>
                Apply the Supabase wines migration, sign in once auth UI is available, then add a
                wine to see it here.
              </p>
            </section>
          )}

          {wines.length > 0 && (
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
                  <button
                    type="button"
                    className="detail-button"
                    aria-label={`View details for ${wine.name}`}
                    onClick={() => {
                      setSelectedWineId(wine.id)
                    }}
                  >
                    View details
                  </button>
                </article>
              ))}
            </section>
          )}
        </>
      )}

      {status === 'ready' && !selectedWineId && currentView === 'cellar' && (
        <CellarView wines={wines} onSelectWine={setSelectedWineId} />
      )}
    </main>
  )
}

type WineDetailProps = {
  backLabel: string
  wine: Wine | null
  onBack: () => void
}

function WineDetail({ backLabel, wine, onBack }: WineDetailProps) {
  if (!wine) {
    return (
      <section className="wine-detail-panel missing-detail" aria-live="polite">
        <div>
          <p className="eyebrow">Wine detail</p>
          <h2>Wine not found</h2>
          <p className="subtitle">
            This wine is no longer in the loaded inventory. Refresh the list or return to the
            inventory view.
          </p>
        </div>
        <button type="button" className="refresh-button" onClick={onBack}>
          {backLabel}
        </button>
      </section>
    )
  }

  return (
    <section className="wine-detail-panel" aria-labelledby="wine-detail-title">
      <div className="detail-header">
        <div>
          <p className="eyebrow">Wine detail</p>
          <h2 id="wine-detail-title">{wine.name}</h2>
          <p className="subtitle">{wine.producer ?? 'Unknown producer'}</p>
        </div>
        <button type="button" className="refresh-button" onClick={onBack}>
          {backLabel}
        </button>
      </div>

      <dl className="detail-grid">
        <DetailField label="Vintage" value={formatNumber(wine.vintage)} />
        <DetailField label="Type" value={wine.type ?? 'Unknown type'} />
        <DetailField label="Variety" value={wine.variety ?? 'N/A'} />
        <DetailField label="Region" value={wine.region ?? 'N/A'} />
        <DetailField label="Price" value={formatPrice(wine.price)} />
        <DetailField label="Purchase date" value={formatDate(wine.purchaseDate)} />
        <DetailField label="Rating" value={wine.rating === null ? 'N/A' : `${wine.rating} / 5`} />
        <DetailField label="Storage" value={formatStorage(wine)} />
        <DetailField label="Status" value={wine.isConsumed ? 'Consumed' : 'In inventory'} />
      </dl>

      {wine.note && (
        <section className="detail-note" aria-label="Tasting notes">
          <h3>Notes</h3>
          <p>{wine.note}</p>
        </section>
      )}
    </section>
  )
}

type DetailFieldProps = {
  label: string
  value: string
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function formatNumber(value: number | null): string {
  return value === null ? 'N/A' : String(value)
}

function formatPrice(value: number | null): string {
  return value === null ? 'N/A' : `$${value.toFixed(2)}`
}

function formatDate(value: string | null): string {
  return value ?? 'N/A'
}

function formatStorage(wine: Wine): string {
  if (!wine.isCellar) {
    return 'Outside storage'
  }

  const position = [
    wine.cellarZone,
    wine.rowNum === null ? null : `Row ${wine.rowNum}`,
    wine.colNum === null ? null : `Col ${wine.colNum}`,
  ]
    .filter(Boolean)
    .join(', ')

  return position ? `Cellar: ${position}` : 'Cellar'
}

export default App
