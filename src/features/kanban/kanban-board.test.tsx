import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createKanbanItemFixture, testCharacters } from '@/test/kanban-fixtures'
import { server } from '@/test/msw-server'
import { renderWithProviders } from '@/test/test-utils'

import type { KanbanItem, KanbanItemCreateInput, KanbanItemPatchInput } from './model/kanban.types'
import { KanbanBoard } from './kanban-board'

const getSectionByHeading = (name: string) => {
  return screen.getByRole('heading', { name }).closest('section') as HTMLElement
}

const setupGraphQLHandler = () => {
  server.use(
    http.post('*/graphql', async ({ request }) => {
      const body = (await request.json()) as {
        operationName?: string
        query?: string
        variables?: {
          ids?: string[]
          name?: string
        }
      }
      const operationName = body.operationName ?? (body.query?.includes('CharactersByIds') ? 'CharactersByIds' : 'Characters')

      if (operationName === 'CharactersByIds') {
        const ids = new Set(body.variables?.ids ?? [])

        return HttpResponse.json({
          data: {
            charactersByIds: testCharacters
              .filter((character) => ids.has(character.id))
              .map(({ id, image, name }) => ({ id, image, name })),
          },
        })
      }

      const search = body.variables?.name?.toLowerCase() ?? ''
      const results = testCharacters.filter((character) => character.name.toLowerCase().includes(search))

      return HttpResponse.json({
        data: {
          characters: {
            info: {
              count: results.length,
              next: null,
              pages: 1,
              prev: null,
            },
            results,
          },
        },
      })
    }),
  )
}

const setupKanbanHandlers = (seedItems: KanbanItem[]) => {
  let items = [...seedItems]

  setupGraphQLHandler()

  server.use(
    http.get('*/api/kanban/items', () => {
      return HttpResponse.json({ items })
    }),
    http.post('*/api/kanban/items', async ({ request }) => {
      const input = (await request.json()) as KanbanItemCreateInput
      const now = '2026-01-02T00:00:00.000Z'
      const item = createKanbanItemFixture({
        assigneeId: input.assigneeId,
        createdAt: now,
        descriptionMarkdown: input.descriptionMarkdown,
        id: 'item-created',
        labels: input.labels,
        position: 2000,
        priority: input.priority,
        status: 'to-do',
        title: input.title,
        updatedAt: now,
      })

      items = [...items, item]

      return HttpResponse.json({ item }, { status: 201 })
    }),
    http.patch('*/api/kanban/items/:itemId', async ({ params, request }) => {
      const input = (await request.json()) as KanbanItemPatchInput
      const itemId = String(params.itemId)
      const item = items.find((candidate) => candidate.id === itemId)

      if (!item) {
        return HttpResponse.json({ message: 'Item not found.' }, { status: 404 })
      }

      const updatedItem = {
        ...item,
        ...input,
        updatedAt: '2026-01-03T00:00:00.000Z',
      }

      items = items.map((candidate) => (candidate.id === itemId ? updatedItem : candidate))

      return HttpResponse.json({ item: updatedItem })
    }),
  )
}

describe('KanbanBoard', () => {
  it('shows the board title, columns, and seeded cards after REST and GraphQL responses load', async () => {
    setupKanbanHandlers([
      createKanbanItemFixture({ id: 'item-1', title: 'Plot portal map', assigneeId: '1', status: 'to-do' }),
      createKanbanItemFixture({ id: 'item-2', title: 'Calibrate spaceship', assigneeId: '2', status: 'doing' }),
      createKanbanItemFixture({ id: 'item-3', title: 'Log adventure notes', assigneeId: '3', status: 'done' }),
    ])

    renderWithProviders(<KanbanBoard />)

    expect(screen.getByRole('heading', { name: 'Interdimensional Adventure Board' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'To do' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Doing' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument()

    expect(await screen.findByRole('button', { name: 'Plot portal map' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Calibrate spaceship' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log adventure notes' })).toBeInTheDocument()
    expect(await screen.findAllByText('Rick Sanchez')).not.toHaveLength(0)
  })

  it('filters cards by priority and shows the filtered empty state when nothing matches', async () => {
    const user = userEvent.setup()

    setupKanbanHandlers([
      createKanbanItemFixture({ id: 'item-1', title: 'Low priority scan', priority: 'low' }),
      createKanbanItemFixture({ id: 'item-2', title: 'High priority repair', priority: 'high' }),
    ])

    renderWithProviders(<KanbanBoard />)

    expect(await screen.findByRole('button', { name: 'Low priority scan' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Priority' }))
    await user.click(screen.getByRole('menuitemradio', { name: 'High' }))

    expect(screen.queryByRole('button', { name: 'Low priority scan' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'High priority repair' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Priority' }))
    await user.click(screen.getByRole('menuitemradio', { name: 'Medium' }))

    expect(screen.getByText('No cards match your filters')).toBeInTheDocument()
  })

  it('creates an item through the dialog and adds it to To do', async () => {
    const user = userEvent.setup()

    setupKanbanHandlers([
      createKanbanItemFixture({ id: 'item-1', title: 'Existing mission', assigneeId: '1' }),
    ])

    renderWithProviders(<KanbanBoard />)

    expect(await screen.findByRole('button', { name: 'Existing mission' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'New item' }))
    await user.type(screen.getByLabelText('Title'), 'Catalog moon artifacts')
    await user.click(screen.getByText('Choose an assignee').closest('button') as HTMLElement)
    await user.click(await screen.findByRole('menuitemradio', { name: /Rick Sanchez/ }))
    await user.selectOptions(screen.getByLabelText('Priority'), 'high')
    await user.type(screen.getByLabelText('Labels'), 'research, moon')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    const todoColumn = getSectionByHeading('To do')

    expect(await within(todoColumn).findByRole('button', { name: 'Catalog moon artifacts' })).toBeInTheDocument()
  })

  it('edits a card title through the dialog and updates the visible card', async () => {
    const user = userEvent.setup()

    setupKanbanHandlers([
      createKanbanItemFixture({ id: 'item-1', title: 'Old mission title', assigneeId: '1' }),
    ])

    renderWithProviders(<KanbanBoard />)

    await user.click(await screen.findByRole('button', { name: 'Old mission title' }))
    await user.clear(screen.getByLabelText('Title'))
    await user.type(screen.getByLabelText('Title'), 'Updated mission title')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('button', { name: 'Updated mission title' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Old mission title' })).not.toBeInTheDocument()
  })

  it('edits a card status through the dialog and moves it to the target column', async () => {
    const user = userEvent.setup()

    setupKanbanHandlers([
      createKanbanItemFixture({ id: 'item-1', title: 'Advance the mission', assigneeId: '1', status: 'to-do' }),
    ])

    renderWithProviders(<KanbanBoard />)

    await user.click(await screen.findByRole('button', { name: 'Advance the mission' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit item' })

    await user.click(within(dialog).getByLabelText('Doing'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    const doingColumn = getSectionByHeading('Doing')
    const todoColumn = getSectionByHeading('To do')

    expect(await within(doingColumn).findByRole('button', { name: 'Advance the mission' })).toBeInTheDocument()
    await waitFor(() => {
      expect(within(todoColumn).queryByRole('button', { name: 'Advance the mission' })).not.toBeInTheDocument()
    })
  })

  it('renders the board alert when the initial item fetch fails', async () => {
    setupGraphQLHandler()
    server.use(
      http.get('*/api/kanban/items', () => {
        return HttpResponse.json({ message: 'Board data exploded.' }, { status: 500 })
      }),
    )

    renderWithProviders(<KanbanBoard />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Board data exploded.')
  })
})
