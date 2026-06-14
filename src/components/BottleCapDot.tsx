import type { SimplifiedWineType } from '../utils/cellarVisual'

type BottleCapDotProps = {
  typeClass: SimplifiedWineType | 'empty'
  depth?: 1 | 2 | 3
}

export function BottleCapDot({ typeClass, depth = 1 }: BottleCapDotProps) {
  return <span className={`bottle-cap-dot ${typeClass} depth-${depth}`} aria-hidden="true" />
}
