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
    await user.click(screen.getByRole('button', { name: /save wine/i }))

    await waitFor(() => {
      expect(mockCreateWine).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Ridge Estate',
          producer: 'Ridge Vineyards',
        }),
      )
    })
    expect(await screen.findByText(/wine saved/i)).toBeInTheDocument()
  })
})
