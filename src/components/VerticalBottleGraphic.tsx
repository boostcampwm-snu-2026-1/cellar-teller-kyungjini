import type { SimplifiedWineType } from '../utils/cellarVisual'

type VerticalBottleGraphicProps = {
  typeClass: SimplifiedWineType | 'empty'
  orientation: 'up' | 'down'
  size?: 'sm' | 'md'
}

export function VerticalBottleGraphic({
  typeClass,
  orientation,
  size = 'md',
}: VerticalBottleGraphicProps) {
  if (typeClass === 'empty') {
    return (
      <svg
        className={`vertical-bottle-svg empty ${orientation} ${size}`}
        viewBox="0 0 24 56"
        aria-hidden="true"
      >
        {orientation === 'up' ? (
          <>
            <rect className="bottle-neck" x="8" y="5" width="8" height="9" rx="3" />
            <rect className="bottle-body" x="5" y="14" width="14" height="34" rx="5" />
          </>
        ) : (
          <>
            <rect className="bottle-body" x="5" y="8" width="14" height="34" rx="5" />
            <rect className="bottle-neck" x="8" y="42" width="8" height="9" rx="3" />
          </>
        )}
      </svg>
    )
  }

  return (
    <svg
      className={`vertical-bottle-svg ${typeClass} ${orientation} ${size}`}
      viewBox="0 0 24 56"
      aria-hidden="true"
    >
      {orientation === 'up' ? (
        <>
          <rect className="bottle-neck" x="8" y="4" width="8" height="10" rx="3" />
          <rect className="bottle-body" x="5" y="14" width="14" height="36" rx="5" />
        </>
      ) : (
        <>
          <rect className="bottle-body" x="5" y="6" width="14" height="36" rx="5" />
          <rect className="bottle-neck" x="8" y="42" width="8" height="10" rx="3" />
        </>
      )}
    </svg>
  )
}
