import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { createWine, listWines } from './services/wineService'

vi.mock('./services/wineService', () => ({
  createWine: vi.fn(),
  listWines: vi.fn(),
}))

const mockCreateWine = vi.mocked(createWine)
const mockListWines = vi.mocked(listWines)

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockCreateWine.mockResolvedValue({
      id: 'wine-1',
      name: 'Chateau Margaux',
      producer: null,
      vintage: null,
      type: null,
      variety: null,
      region: null,
      price: null,
      purchaseDate: null,
      note: null,
      isCellar: false,
      cellarZone: null,
      rowNum: null,
      colNum: null,
      rating: null,
      isConsumed: false,
      drinkingDate: null,
      labelImageUrl: null,
      createdAt: '2026-06-09T00:00:00.000Z',
    })
    mockListWines.mockResolvedValue([])
  })

  it('renders the inventory page and empty state', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /wine inventory/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /add wine/i })).toBeInTheDocument()

    expect(await screen.findByRole('heading', { name: /no wines yet/i })).toBeInTheDocument()
  })

  it('saves a wine with form values', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.type(screen.getByLabelText(/name/i), 'Ridge Estate')
    await user.type(screen.getByLabelText(/producer/i), 'Ridge Vineyards')
    await user.type(screen.getByLabelText(/vintage/i), '2021')
    await user.type(screen.getByLabelText(/price/i), '45.5')
    await user.click(screen.getByRole('button', { name: /save wine/i }))

    await waitFor(() => {
      expect(mockCreateWine).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Ridge Estate',
          producer: 'Ridge Vineyards',
          vintage: 2021,
          price: 45.5,
        }),
      )
    })
    expect(await screen.findByText(/wine saved/i)).toBeInTheDocument()
  })

  it('blocks invalid form values before saving', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.type(screen.getByLabelText(/name/i), 'Ridge Estate')
    await user.type(screen.getByLabelText(/vintage/i), '1700')
    await user.type(screen.getByLabelText(/price/i), '-1')
    await user.click(screen.getByRole('button', { name: /save wine/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /vintage must be a whole number between 1800 and 2200/i,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/price must be greater than or equal to 0/i)
    expect(mockCreateWine).not.toHaveBeenCalled()
  })
})
