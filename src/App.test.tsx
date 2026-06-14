import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { createWine, listWines } from './services/wineService'

vi.mock('./services/wineService', () => ({
  createWine: vi.fn(),
  listWines: vi.fn(),
  resetWines: vi.fn(),
  updateWineCellarPosition: vi.fn(),
  swapWineCellarPositions: vi.fn(),
}))

const mockCreateWine = vi.mocked(createWine)
const mockListWines = vi.mocked(listWines)

const wine = {
  id: 'wine-1',
  name: 'Ridge Estate',
  producer: 'Ridge Vineyards',
  vintage: 2021,
  type: 'Red',
  variety: 'Cabernet Sauvignon',
  region: 'Santa Cruz Mountains',
  price: 45,
  purchaseDate: '2026-06-09',
  note: 'Black cherry and cedar.',
  isCellar: true,
  cellarZone: 'A',
  rowNum: 2,
  colNum: 3,
  depthNum: 1,
  rating: 4,
  isConsumed: false,
  drinkingDate: null,
  labelImageUrl: null,
  createdAt: '2026-06-09T00:00:00.000Z',
}

const outsideWine = {
  ...wine,
  id: 'wine-2',
  name: 'Counter Bottle',
  isCellar: false,
  cellarZone: null,
  rowNum: null,
  colNum: null,
  depthNum: null,
}

async function openAddWineForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: /add wine/i }))
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockCreateWine.mockResolvedValue(wine)
    mockListWines.mockResolvedValue([])
  })

  it('renders the inventory page and empty state', async () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /wine inventory/i })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /add wine/i })).toBeInTheDocument()

    expect(await screen.findByRole('heading', { name: /no wines yet/i })).toBeInTheDocument()
  })

  it('saves a wine with form values', async () => {
    const user = userEvent.setup()

    render(<App />)

    await openAddWineForm(user)

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

    await openAddWineForm(user)

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

  it('opens a selected wine detail view from the inventory list', async () => {
    const user = userEvent.setup()

    mockListWines.mockResolvedValue([wine])
    render(<App />)

    await user.click(
      await screen.findByRole('button', { name: /view details for ridge vineyards, ridge estate/i }),
    )

    expect(screen.getByRole('heading', { name: /ridge vineyards, ridge estate/i })).toBeInTheDocument()
    expect(screen.getByText('Cellar: A, Shelf 2, Slot 3')).toBeInTheDocument()
    expect(screen.getByText('Black cherry and cedar.')).toBeInTheDocument()
  })

  it('shows a recoverable state when the selected wine is no longer loaded', async () => {
    const user = userEvent.setup()

    mockListWines.mockResolvedValueOnce([wine]).mockResolvedValueOnce([])
    render(<App />)

    await user.click(
      await screen.findByRole('button', { name: /view details for ridge vineyards, ridge estate/i }),
    )
    await user.click(screen.getByRole('button', { name: /refresh/i }))

    expect(await screen.findByRole('heading', { name: /wine not found/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /back to wine list/i }))

    expect(await screen.findByRole('heading', { name: /no wines yet/i })).toBeInTheDocument()
  })

  it('renders a cellar grid from loaded wine positions', async () => {
    const user = userEvent.setup()

    mockListWines.mockResolvedValue([wine, outsideWine])
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^cellar$/i }))

    expect(await screen.findByRole('heading', { name: /home cellar/i })).toBeInTheDocument()
    expect(screen.getByText('T4')).toBeInTheDocument()
  })

  it('opens wine detail from the cellar shelf and returns to the cellar', async () => {
    const user = userEvent.setup()

    mockListWines.mockResolvedValue([wine])
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^cellar$/i }))
    await user.click(await screen.findByRole('button', { name: /open shelf t4/i }))
    await user.click(await screen.findByLabelText(/ridge vineyards, ridge estate/i))

    expect(screen.getByRole('heading', { name: /ridge estate/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /back to shelf t4/i }))

    expect(await screen.findByRole('heading', { name: /shelf t4/i })).toBeInTheDocument()
  })

  it('returns from wine detail to the shelf overview', async () => {
    const user = userEvent.setup()

    mockListWines.mockResolvedValue([wine])
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^cellar$/i }))
    await user.click(await screen.findByRole('button', { name: /open shelf t4/i }))
    await user.click(await screen.findByRole('button', { name: /back to shelves/i }))

    expect(await screen.findByRole('button', { name: /open shelf t4/i })).toBeInTheDocument()
  })

  it('renders the recommendation tab', async () => {
    const user = userEvent.setup()

    mockListWines.mockResolvedValue([wine])
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^recommend$/i }))

    expect(await screen.findByRole('heading', { name: /오늘 어떤 와인을 마실까요/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /추천 받기/i })).toBeDisabled()
  })
})
