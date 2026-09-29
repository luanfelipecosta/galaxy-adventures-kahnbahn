import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { createKanbanItemFixture } from '@/test/kanban-fixtures'
import { server } from '@/test/msw-server'

import { createKanbanItem, getKanbanItems, patchKanbanItem } from './kanban-api'

describe('kanban API', () => {
  it('reads item arrays from /api/kanban/items', async () => {
    const items = [
      createKanbanItemFixture({ id: 'item-1', title: 'Plan portal jump' }),
      createKanbanItemFixture({ id: 'item-2', title: 'Pack crystals', status: 'doing' }),
    ]

    server.use(
      http.get('*/api/kanban/items', () => {
        return HttpResponse.json({ items })
      }),
    )

    await expect(getKanbanItems()).resolves.toEqual(items)
  })

  it('sends POST JSON and returns the created item', async () => {
    const createdItem = createKanbanItemFixture({
      id: 'item-created',
      priority: 'high',
      title: 'Chart nebula shortcut',
    })

    server.use(
      http.post('*/api/kanban/items', async ({ request }) => {
        await expect(request.json()).resolves.toEqual({
          assigneeId: '1',
          descriptionMarkdown: 'Use the safer route.',
          labels: ['navigation'],
          priority: 'high',
          title: 'Chart nebula shortcut',
        })

        return HttpResponse.json({ item: createdItem }, { status: 201 })
      }),
    )

    await expect(
      createKanbanItem({
        assigneeId: '1',
        descriptionMarkdown: 'Use the safer route.',
        labels: ['navigation'],
        priority: 'high',
        title: 'Chart nebula shortcut',
      }),
    ).resolves.toEqual(createdItem)
  })

  it('sends PATCH JSON and surfaces API error messages', async () => {
    server.use(
      http.patch('*/api/kanban/items/:itemId', async ({ params, request }) => {
        expect(params.itemId).toBe('item-1')
        await expect(request.json()).resolves.toEqual({ status: 'done' })

        return HttpResponse.json({ message: 'Cannot move from To do to Done.' }, { status: 400 })
      }),
    )

    await expect(patchKanbanItem('item-1', { status: 'done' })).rejects.toThrow('Cannot move from To do to Done.')
  })
})
