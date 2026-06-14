import { useMemo, useState, type DragEvent, type MouseEvent } from 'react'
import { CELLAR_SHELVES, CELLAR_ZONE, DEPTH_LABELS, type CellarShelfConfig } from '../config/cellarLayout'
import type { CellarMoveTarget } from '../types/cellar'
import type { Wine } from '../types/wine'
import {
  buildWinesBySlot,
  countDepthStack,
  countShelfBottles,
  formatWineHoverLabel,
  getSlotKey,
  getFrontWine,
  getVerticalBottleOrientation,
  getWineAtSlot,
  isPositionedCellarWine,
  resolveOverviewDropDepth,
  simplifyWineType,
} from '../utils/cellarVisual'
import { BottleCapDot } from './BottleCapDot'
import { VerticalBottleGraphic } from './VerticalBottleGraphic'
import './CellarView.css'

type CellarViewProps = {
  wines: Wine[]
  openShelfLabel: string | null
  moveStatus: 'idle' | 'saving'
  moveError: string | null
  onOpenShelfChange: (label: string | null) => void
  onSelectWine: (wineId: string) => void
  onMoveWine: (sourceWineId: string, target: CellarMoveTarget) => Promise<void>
}

export function CellarView({
  wines,
  openShelfLabel,
  moveStatus,
  moveError,
  onOpenShelfChange,
  onSelectWine,
  onMoveWine,
}: CellarViewProps) {
  const [draggingWineId, setDraggingWineId] = useState<string | null>(null)
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null)

  const cellarWines = wines.filter(isPositionedCellarWine)
  const outsideWines = wines.filter((wine) => !isPositionedCellarWine(wine))
  const slotsByKey = useMemo(() => buildWinesBySlot(cellarWines), [cellarWines])
  const openShelf = openShelfLabel ? CELLAR_SHELVES.find((s) => s.label === openShelfLabel) : null

  function handleDragStart(wineId: string) {
    setDraggingWineId(wineId)
  }

  function handleDragEnd() {
    setDraggingWineId(null)
    setDropTargetKey(null)
  }

  function handleDrop(sourceWineId: string, target: CellarMoveTarget) {
    setDropTargetKey(null)
    setDraggingWineId(null)
    void onMoveWine(sourceWineId, target).catch(() => {
      // Parent handles rollback and error display.
    })
  }

  return (
    <section className="cellar-view" aria-labelledby="cellar-view-title">
      <div className="cellar-header">
        <div>
          <p className="eyebrow">Cellar map</p>
          <h2 id="cellar-view-title">Home cellar</h2>
          <p className="subtitle">
            Hover a bottle cap for name, drag to rearrange. Open a shelf to see vertical bottles.
          </p>
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

      <div className="cellar-legend" aria-label="Bottle legend">
        <span className="legend-item">
          <BottleCapDot typeClass="red" />
          Red
        </span>
        <span className="legend-item">
          <BottleCapDot typeClass="white" />
          White
        </span>
        <span className="legend-item">
          <BottleCapDot typeClass="sparkling" />
          Sparkling
        </span>
        <span className="legend-note">Caps in overview · Vertical bottles inside a shelf</span>
      </div>

      {moveStatus === 'saving' && (
        <p className="cellar-status" role="status">
          Saving cellar layout...
        </p>
      )}

      {moveError && (
        <p className="form-message error-message" role="alert">
          {moveError}
        </p>
      )}

      {!openShelf ? (
        <div className="cellar-rack" aria-label="Cellar shelves overview">
          {CELLAR_SHELVES.map((shelf) => (
            <ShelfOverviewRow
              key={shelf.label}
              shelf={shelf}
              slotsByKey={slotsByKey}
              draggingWineId={draggingWineId}
              dropTargetKey={dropTargetKey}
              onOpen={() => {
                onOpenShelfChange(shelf.label)
              }}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDropTargetChange={setDropTargetKey}
              onDrop={handleDrop}
            />
          ))}
        </div>
      ) : (
        <ShelfDetailPanel
          shelf={openShelf}
          slotsByKey={slotsByKey}
          draggingWineId={draggingWineId}
          dropTargetKey={dropTargetKey}
          onBack={() => {
            onOpenShelfChange(null)
          }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDropTargetChange={setDropTargetKey}
          onDrop={handleDrop}
          onSelectWine={onSelectWine}
        />
      )}

      <OutsideStoragePanel
        outsideWines={outsideWines}
        draggingWineId={draggingWineId}
        dropTargetKey={dropTargetKey}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDropTargetChange={setDropTargetKey}
        onDrop={handleDrop}
        onSelectWine={onSelectWine}
      />
    </section>
  )
}

type DragDropHandlers = {
  draggingWineId: string | null
  dropTargetKey: string | null
  onDragStart: (wineId: string) => void
  onDragEnd: () => void
  onDropTargetChange: (key: string | null) => void
  onDrop: (sourceWineId: string, target: CellarMoveTarget) => void
}

type ShelfOverviewRowProps = DragDropHandlers & {
  shelf: CellarShelfConfig
  slotsByKey: Map<string, Wine[]>
  onOpen: () => void
}

function ShelfOverviewRow({
  shelf,
  slotsByKey,
  draggingWineId,
  dropTargetKey,
  onOpen,
  onDragStart,
  onDragEnd,
  onDropTargetChange,
  onDrop,
}: ShelfOverviewRowProps) {
  const filledCount = countShelfBottles(slotsByKey, shelf.rowNum, shelf.slotCount, shelf.maxDepth)
  const totalCapacity = shelf.slotCount * shelf.maxDepth

  return (
    <div className="cellar-shelf-row">
      <button
        type="button"
        className="shelf-open-trigger"
        aria-label={`Open shelf ${shelf.label}, ${filledCount} of ${totalCapacity} slots filled`}
        onClick={onOpen}
      >
        {shelf.label}
      </button>
      <div className="shelf-face" aria-label={`Shelf ${shelf.label} bottles`}>
        {Array.from({ length: shelf.slotCount }, (_, index) => {
          const column = index + 1
          const frontWine = getFrontWine(slotsByKey, shelf.rowNum, column)

          return (
            <OverviewColumnSlot
              key={column}
              shelf={shelf}
              column={column}
              wine={frontWine}
              stackCount={countDepthStack(slotsByKey, shelf.rowNum, column, shelf.maxDepth)}
              slotsByKey={slotsByKey}
              draggingWineId={draggingWineId}
              dropTargetKey={dropTargetKey}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDropTargetChange={onDropTargetChange}
              onDrop={onDrop}
            />
          )
        })}
      </div>
      <span className="shelf-meta">
        {filledCount}/{totalCapacity}
      </span>
    </div>
  )
}

type OverviewColumnSlotProps = DragDropHandlers & {
  shelf: CellarShelfConfig
  column: number
  wine: Wine | null
  stackCount: number
  slotsByKey: Map<string, Wine[]>
}

function OverviewColumnSlot({
  shelf,
  column,
  wine,
  stackCount,
  slotsByKey,
  draggingWineId,
  dropTargetKey,
  onDragStart,
  onDragEnd,
  onDropTargetChange,
  onDrop,
}: OverviewColumnSlotProps) {
  const columnDropKey = `column-${shelf.rowNum}-${column}`
  const isDropTarget = dropTargetKey === columnDropKey

  return (
    <div className="shelf-cap-column">
      <div
        className={`overview-cap-slot ${wine ? 'occupied' : 'empty'} ${
          isDropTarget ? 'drop-target-active' : ''
        } ${draggingWineId === wine?.id ? 'dragging' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          onDropTargetChange(columnDropKey)
        }}
        onDragLeave={() => {
          if (dropTargetKey === columnDropKey) {
            onDropTargetChange(null)
          }
        }}
        onDrop={(event) => {
          event.preventDefault()
          event.stopPropagation()
          const sourceWineId = readDraggedWineId(event, draggingWineId)
          if (!sourceWineId) {
            return
          }

          const depth = resolveOverviewDropDepth(slotsByKey, shelf.rowNum, column, shelf.maxDepth)

          onDrop(sourceWineId, {
            type: 'slot',
            row: shelf.rowNum,
            column,
            depth,
            zone: CELLAR_ZONE,
          })
        }}
      >
        {wine ? (
          <div
            className="overview-cap-draggable"
            draggable
            title={formatWineHoverLabel(wine)}
            onDragStart={(event) => {
              event.stopPropagation()
              event.dataTransfer.setData('text/plain', wine.id)
              event.dataTransfer.effectAllowed = 'move'
              onDragStart(wine.id)
            }}
            onDragEnd={onDragEnd}
          >
            <BottleCapDot typeClass={simplifyWineType(wine.type)} />
            {stackCount > 1 && (
              <span className="cap-stack-badge" aria-label={`${stackCount} bottles in slot`}>
                {stackCount}
              </span>
            )}
            <BottleHoverCard wine={wine} />
          </div>
        ) : (
          <BottleCapDot typeClass="empty" />
        )}
      </div>
    </div>
  )
}

type ShelfDetailPanelProps = DragDropHandlers & {
  shelf: CellarShelfConfig
  slotsByKey: Map<string, Wine[]>
  onBack: () => void
  onSelectWine: (wineId: string) => void
}

function ShelfDetailPanel({
  shelf,
  slotsByKey,
  draggingWineId,
  dropTargetKey,
  onBack,
  onDragStart,
  onDragEnd,
  onDropTargetChange,
  onDrop,
  onSelectWine,
}: ShelfDetailPanelProps) {
  const columns = Array.from({ length: shelf.slotCount }, (_, index) => index + 1)
  const depths = Array.from({ length: shelf.maxDepth }, (_, index) => index + 1)

  return (
    <section className="shelf-detail-panel" aria-labelledby={`shelf-${shelf.label}-title`}>
      <div className="shelf-detail-header">
        <div>
          <p className="eyebrow">Open shelf</p>
          <h3 id={`shelf-${shelf.label}-title`}>Shelf {shelf.label}</h3>
          <p className="subtitle">
            Eight vertical bottles per layer, necks alternating up and down. Hover for details.
          </p>
        </div>
        <button type="button" className="refresh-button" onClick={onBack}>
          Back to shelves
        </button>
      </div>

      <div className="shelf-layer-stack" aria-label={`Shelf ${shelf.label} layers`}>
        {depths.map((depth) => (
          <section
            key={depth}
            className="shelf-depth-section"
            aria-label={`${DEPTH_LABELS[depth - 1] ?? `Layer ${depth}`} layer`}
          >
            {shelf.maxDepth > 1 && (
              <h4 className="depth-section-label">{DEPTH_LABELS[depth - 1] ?? `Layer ${depth}`}</h4>
            )}
            <div className="shelf-unfold">
              <div className="shelf-bottle-row shelf-bottle-row-single">
                {columns.map((column) => (
                  <ShelfBottleSlot
                    key={`${depth}-${column}`}
                    shelf={shelf}
                    column={column}
                    depth={depth}
                    orientation={getVerticalBottleOrientation(column)}
                    slotsByKey={slotsByKey}
                    draggingWineId={draggingWineId}
                    dropTargetKey={dropTargetKey}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDropTargetChange={onDropTargetChange}
                    onDrop={onDrop}
                    onSelectWine={onSelectWine}
                  />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

type ShelfBottleSlotProps = DragDropHandlers & {
  shelf: CellarShelfConfig
  column: number
  depth: number
  orientation: 'up' | 'down'
  slotsByKey: Map<string, Wine[]>
  onSelectWine: (wineId: string) => void
}

function ShelfBottleSlot({
  shelf,
  column,
  depth,
  orientation,
  slotsByKey,
  draggingWineId,
  dropTargetKey,
  onDragStart,
  onDragEnd,
  onDropTargetChange,
  onDrop,
  onSelectWine,
}: ShelfBottleSlotProps) {
  const slotKey = getSlotKey(shelf.rowNum, column, depth)
  const wine = getWineAtSlot(slotsByKey, shelf.rowNum, column, depth)
  const isDropTarget = dropTargetKey === slotKey

  return (
    <div
      className={`shelf-bottle-slot ${wine ? 'occupied' : 'empty'} ${
        isDropTarget ? 'drop-target-active' : ''
      }`}
      onDragOver={(event) => {
        event.preventDefault()
        onDropTargetChange(slotKey)
      }}
      onDragLeave={() => {
        if (dropTargetKey === slotKey) {
          onDropTargetChange(null)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        const sourceWineId = readDraggedWineId(event, draggingWineId)
        if (!sourceWineId) {
          return
        }

        onDrop(sourceWineId, {
          type: 'slot',
          row: shelf.rowNum,
          column,
          depth,
          zone: CELLAR_ZONE,
        })
      }}
    >
      {wine ? (
        <CellarBottle
          wine={wine}
          orientation={orientation}
          draggingWineId={draggingWineId}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onSelectWine={onSelectWine}
        />
      ) : (
        <VerticalBottleGraphic typeClass="empty" orientation={orientation} size="md" />
      )}
    </div>
  )
}

type OutsideStoragePanelProps = DragDropHandlers & {
  outsideWines: Wine[]
  onSelectWine: (wineId: string) => void
}

function OutsideStoragePanel({
  outsideWines,
  draggingWineId,
  dropTargetKey,
  onDragStart,
  onDragEnd,
  onDropTargetChange,
  onDrop,
  onSelectWine,
}: OutsideStoragePanelProps) {
  return (
    <section
      className={`outside-storage ${dropTargetKey === 'outside' ? 'drop-target-active' : ''}`}
      aria-labelledby="outside-storage-title"
      onDragOver={(event) => {
        event.preventDefault()
        onDropTargetChange('outside')
      }}
      onDragLeave={() => {
        if (dropTargetKey === 'outside') {
          onDropTargetChange(null)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        const sourceWineId = readDraggedWineId(event, draggingWineId)
        if (!sourceWineId) {
          return
        }

        onDrop(sourceWineId, { type: 'outside' })
      }}
    >
      <div>
        <p className="eyebrow">Outside storage</p>
        <h2 id="outside-storage-title">Unmapped bottles</h2>
        <p className="subtitle">Drag bottles here to take them out of the cellar shelves.</p>
      </div>
      {outsideWines.length > 0 ? (
        <div className="outside-list">
          {outsideWines.map((wine) => (
            <div key={wine.id} className="outside-bottle-card">
              <CellarBottle
                wine={wine}
                orientation="up"
                draggingWineId={draggingWineId}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onSelectWine={onSelectWine}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-inline">Drop cellar bottles here to store them outside.</p>
      )}
    </section>
  )
}

type BottleHoverCardProps = {
  wine: Wine
}

function BottleHoverCard({ wine }: BottleHoverCardProps) {
  return (
    <span className="bottle-hover-card" role="tooltip">
      {formatWineHoverLabel(wine)}
    </span>
  )
}

type CellarBottleProps = {
  wine: Wine
  orientation: 'up' | 'down'
  draggingWineId: string | null
  onDragStart: (wineId: string) => void
  onDragEnd: () => void
  onSelectWine: (wineId: string) => void
}

function CellarBottle({
  wine,
  orientation,
  draggingWineId,
  onDragStart,
  onDragEnd,
  onSelectWine,
}: CellarBottleProps) {
  const typeClass = simplifyWineType(wine.type)

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (event.detail > 0) {
      onSelectWine(wine.id)
    }
  }

  return (
    <div
      className={`cellar-bottle ${draggingWineId === wine.id ? 'dragging' : ''}`}
      draggable
      aria-label={formatWineHoverLabel(wine)}
      onClick={handleClick}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', wine.id)
        event.dataTransfer.effectAllowed = 'move'
        onDragStart(wine.id)
      }}
      onDragEnd={onDragEnd}
    >
      <VerticalBottleGraphic typeClass={typeClass} orientation={orientation} size="md" />
      <BottleHoverCard wine={wine} />
    </div>
  )
}

function readDraggedWineId(event: DragEvent<HTMLElement>, draggingWineId: string | null): string | null {
  return event.dataTransfer.getData('text/plain') || draggingWineId
}
