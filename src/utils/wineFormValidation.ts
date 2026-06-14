import type { CreateWineInput } from '../types/wine'

const MIN_VINTAGE = 1800
const MAX_VINTAGE = 2200

export type WineFormValidationResult =
  | { ok: true; input: CreateWineInput }
  | { ok: false; errors: string[] }

export function buildCreateWineInput(formData: FormData): WineFormValidationResult {
  const errors: string[] = []
  const name = getText(formData, 'name')
  const vintage = parseOptionalWholeNumber(getText(formData, 'vintage'))
  const price = parseOptionalNumber(getText(formData, 'price'))
  const rating = parseOptionalWholeNumber(getText(formData, 'rating'))
  const purchaseDate = getText(formData, 'purchaseDate')

  if (!name) {
    errors.push('Wine name is required.')
  }

  if (vintage.value !== undefined && !isBetween(vintage.value, MIN_VINTAGE, MAX_VINTAGE)) {
    errors.push(`Vintage must be a whole number between ${MIN_VINTAGE} and ${MAX_VINTAGE}.`)
  } else if (vintage.error) {
    errors.push('Vintage must be a whole number.')
  }

  if (price.value !== undefined && price.value < 0) {
    errors.push('Price must be greater than or equal to 0.')
  } else if (price.error) {
    errors.push('Price must be a valid number.')
  }

  if (purchaseDate && !isValidDateString(purchaseDate)) {
    errors.push('Purchase date must be a valid YYYY-MM-DD date.')
  }

  if (rating.value !== undefined && !isBetween(rating.value, 1, 5)) {
    errors.push('Rating must be a whole number between 1 and 5.')
  } else if (rating.error) {
    errors.push('Rating must be a whole number.')
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    input: {
      name,
      producer: getText(formData, 'producer'),
      vintage: vintage.value,
      type: getText(formData, 'type'),
      variety: getText(formData, 'variety'),
      region: getText(formData, 'region'),
      price: price.value,
      purchaseDate: purchaseDate || undefined,
      note: getText(formData, 'note'),
      rating: rating.value,
    },
  }
}

function getText(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim()
}

function parseOptionalNumber(text: string): { value?: number; error?: true } {
  if (!text) {
    return {}
  }

  const value = Number(text)

  if (!Number.isFinite(value)) {
    return { error: true }
  }

  return { value }
}

function parseOptionalWholeNumber(text: string): { value?: number; error?: true } {
  const parsed = parseOptionalNumber(text)

  if (parsed.value === undefined || parsed.error) {
    return parsed
  }

  if (!Number.isInteger(parsed.value)) {
    return { error: true }
  }

  return parsed
}

function isBetween(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

function isValidDateString(text: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)

  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}
