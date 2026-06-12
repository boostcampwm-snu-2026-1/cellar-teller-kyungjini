import { describe, expect, it } from 'vitest'
import { buildCreateWineInput } from './wineFormValidation'

describe('buildCreateWineInput', () => {
  it('returns trimmed create input for valid form data', () => {
    const formData = new FormData()

    formData.set('name', ' Ridge Estate ')
    formData.set('producer', ' Ridge Vineyards ')
    formData.set('vintage', '2021')
    formData.set('type', 'Red')
    formData.set('variety', 'Cabernet Sauvignon')
    formData.set('region', 'Santa Cruz Mountains')
    formData.set('purchaseDate', '2026-06-09')
    formData.set('price', '45.5')
    formData.set('rating', '4')
    formData.set('note', ' Black cherry. ')

    expect(buildCreateWineInput(formData)).toEqual({
      ok: true,
      input: {
        name: 'Ridge Estate',
        producer: 'Ridge Vineyards',
        vintage: 2021,
        type: 'Red',
        variety: 'Cabernet Sauvignon',
        region: 'Santa Cruz Mountains',
        purchaseDate: '2026-06-09',
        price: 45.5,
        rating: 4,
        note: 'Black cherry.',
      },
    })
  })

  it('rejects invalid numeric and date values', () => {
    const formData = new FormData()

    formData.set('name', 'Ridge Estate')
    formData.set('vintage', '1799')
    formData.set('purchaseDate', '2026-02-30')
    formData.set('price', '-1')
    formData.set('rating', '6')

    expect(buildCreateWineInput(formData)).toEqual({
      ok: false,
      errors: [
        'Vintage must be a whole number between 1800 and 2200.',
        'Price must be greater than or equal to 0.',
        'Purchase date must be a valid YYYY-MM-DD date.',
        'Rating must be a whole number between 1 and 5.',
      ],
    })
  })
})
