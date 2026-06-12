import type { Wine } from '../types/wine'

const CELLAR_ROWS = 5
const CELLAR_COLUMNS = 6

type CellarViewProps = {
  wines: Wine[]
  onSelectWine: (wineId: string) => void
}

export function CellarView({ wines, onSelectWine }: CellarViewProps) {
  const cellarWines = wines.filter(isPositionedCellarWine)
  const outsideWines = wines.filter((wine) => !isPositionedCellarWine(wine))
  const slotsByPosition = new Map<string, Wine[]>()

  for (const wine of cellarWines) {
    const key = getSlotKey(wine.rowNum, wine.colNum)
    const existingSlot = slotsByPosition.get(key) ?? []

    slotsByPosition.set(key, [...existingSlot, wine])
  }

  return (
    <section className="cellar-view" aria-labelledby="cellar-view-title">
      <div className="cellar-header">
        <div>
          <p className="eyebrow">Cellar map</p>
          <h2 id="cellar-view-title">Zone A</h2>
          <p className="subtitle">Supabase cellar positions rendered as a 5 by 6 grid.</p>
        </div>
        <dl className="cellar-summary" aria-label="Cellar summary">
          <div>
            <dt>Cellar</dt>
            <dd>{cellarWines.length}</dd>
          </div>
          <div>
            <dt>Outside</dt>
            <dd>{outsideWines.length}</dd>
          </div>
        </dl>
      </div>

      <div className="cellar-grid" aria-label="Cellar slots">
        {createSlots().map(({ row, column }) => {
          const slotWines = slotsByPosition.get(getSlotKey(row, column)) ?? []
          const primaryWine = slotWines[0]

          return (
            <button
              key={getSlotKey(row, column)}
              type="button"
              className={`cellar-slot ${primaryWine ? 'occupied' : 'empty'}`}
              disabled={!primaryWine}
              aria-label={
                primaryWine
                  ? `View details for ${primaryWine.name} in cellar row ${row} column ${column}`
                  : `Empty cellar slot row ${row} column ${column}`
              }
              onClick={() => {
                if (primaryWine) {
                  onSelectWine(primaryWine.id)
                }
              }}
            >
              <span className="slot-code">
                R{row} C{column}
              </span>
              {primaryWine ? (
                <>
                  <strong>{primaryWine.name}</strong>
                  <span>{formatSlotMeta(primaryWine)}</span>
                  {slotWines.length > 1 && <em>+{slotWines.length - 1} more</em>}
                </>
              ) : (
                <span>Empty</span>
              )}
            </button>
          )
        })}
      </div>

      <section className="outside-storage" aria-labelledby="outside-storage-title">
        <div>
          <p className="eyebrow">Outside storage</p>
          <h2 id="outside-storage-title">Unmapped bottles</h2>
        </div>
        {outsideWines.length > 0 ? (
          <div className="outside-list">
            {outsideWines.map((wine) => (
              <button
                key={wine.id}
                type="button"
                className="outside-bottle"
                onClick={() => {
                  onSelectWine(wine.id)
                }}
              >
                <strong>{wine.name}</strong>
                <span>{formatSlotMeta(wine)}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="empty-inline">No outside storage bottles.</p>
        )}
      </section>
    </section>
  )
}

function createSlots(): Array<{ row: number; column: number }> {
  return Array.from({ length: CELLAR_ROWS }, (_, rowIndex) =>
    Array.from({ length: CELLAR_COLUMNS }, (_, columnIndex) => ({
      row: rowIndex + 1,
      column: columnIndex + 1,
    })),
  ).flat()
}

function isPositionedCellarWine(wine: Wine): boolean {
  return wine.isCellar && wine.rowNum !== null && wine.colNum !== null
}

function getSlotKey(row: number | null, column: number | null): string {
  return `${row ?? 'x'}-${column ?? 'x'}`
}

function formatSlotMeta(wine: Wine): string {
  const parts = [wine.producer, wine.vintage === null ? null : String(wine.vintage)].filter(Boolean)

  return parts.length > 0 ? parts.join(' · ') : 'Unknown producer'
}
