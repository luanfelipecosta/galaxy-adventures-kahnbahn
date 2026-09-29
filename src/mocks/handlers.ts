import { delay, http, HttpResponse } from 'msw'

import seedKanbanItems from './data/kanban-items.json'

import { KANBAN_PRIORITIES } from '@/features/kanban/kanban.constants'
import type { KanbanItem, KanbanItemCreateInput, KanbanItemPatchInput, KanbanItemResponse, KanbanItemsResponse } from '@/features/kanban'
import { canMoveItem } from '@/features/kanban'
import { formatStatus, getNextPosition, isKanbanStatus } from '@/features/kanban/kanban.utils'

const MOCK_DELAY_IN_MS = 650

let kanbanItems = structuredClone(seedKanbanItems) as KanbanItem[]

const createId = (prefix: string) => {
  return `${prefix}-${globalThis.crypto.randomUUID()}`
}

const getNow = () => {
  return new Date().toISOString()
}

const jsonError = (message: string, status = 400) => {
  return HttpResponse.json({ message }, { status })
}

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

const isKanbanPriority = (value: unknown): value is KanbanItem['priority'] => {
  return typeof value === 'string' && KANBAN_PRIORITIES.includes(value as KanbanItem['priority'])
}

const isValidAssigneeId = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0
}

const validateCreateInput = (input: KanbanItemCreateInput) => {
  if (!input.title?.trim()) {
    return 'Title is required.'
  }

  if (!isValidAssigneeId(input.assigneeId)) {
    return 'Assignee is required.'
  }

  if (!isKanbanPriority(input.priority)) {
    return 'Priority is invalid.'
  }

  if (!isStringArray(input.labels)) {
    return 'Labels must be a string array.'
  }

  return null
}

const updateMutableFields = (item: KanbanItem, input: KanbanItemPatchInput, now: string): KanbanItem | string => {
  const nextItem: KanbanItem = {
    ...item,
    logs: [...item.logs],
  }

  if ('title' in input) {
    if (typeof input.title !== 'string' || !input.title.trim()) {
      return 'Title is required.'
    }

    nextItem.title = input.title.trim()
  }

  if ('descriptionMarkdown' in input) {
    if (typeof input.descriptionMarkdown !== 'string') {
      return 'Description must be a string.'
    }

    nextItem.descriptionMarkdown = input.descriptionMarkdown
  }

  if ('assigneeId' in input) {
    if (!isValidAssigneeId(input.assigneeId)) {
      return 'Assignee is required.'
    }

    nextItem.assigneeId = input.assigneeId.trim()
  }

  if ('priority' in input) {
    const nextPriority = input.priority

    if (!isKanbanPriority(nextPriority)) {
      return 'Priority is invalid.'
    }

    nextItem.priority = nextPriority
  }

  if ('labels' in input) {
    if (!isStringArray(input.labels)) {
      return 'Labels must be a string array.'
    }

    nextItem.labels = input.labels
  }

  if ('position' in input) {
    if (typeof input.position !== 'number' || Number.isNaN(input.position)) {
      return 'Position must be a number.'
    }

    nextItem.position = input.position
  }

  if ('status' in input) {
    if (!isKanbanStatus(input.status)) {
      return 'Status is invalid.'
    }

    if (!canMoveItem(item.status, input.status)) {
      return `Cannot move from ${formatStatus(item.status)} to ${formatStatus(input.status)}.`
    }

    if (input.status !== item.status) {
      nextItem.status = input.status
      nextItem.logs.push({
        id: createId('log'),
        type: 'status',
        message: `Moved from ${formatStatus(item.status)} to ${formatStatus(input.status)}.`,
        createdAt: now,
        fromStatus: item.status,
        toStatus: input.status,
      })
    }
  }

  if (input.manualLog?.message?.trim()) {
    nextItem.logs.push({
      id: createId('log'),
      type: 'manual',
      message: input.manualLog.message.trim(),
      createdAt: now,
    })
  }

  nextItem.updatedAt = now

  return nextItem
}

export const handlers = [
  http.get('/api/kanban/items', async () => {
    await delay(MOCK_DELAY_IN_MS)

    return HttpResponse.json<KanbanItemsResponse>({ items: kanbanItems })
  }),

  http.post('/api/kanban/items', async ({ request }) => {
    await delay(MOCK_DELAY_IN_MS)

    const input = (await request.json()) as KanbanItemCreateInput
    const validationError = validateCreateInput(input)

    if (validationError) {
      return jsonError(validationError)
    }

    const now = getNow()
    const item: KanbanItem = {
      id: createId('item'),
      title: input.title.trim(),
      descriptionMarkdown: input.descriptionMarkdown,
      assigneeId: input.assigneeId.trim(),
      status: 'to-do',
      position: getNextPosition(kanbanItems, 'to-do'),
      priority: input.priority,
      labels: input.labels,
      createdAt: now,
      updatedAt: now,
      logs: [
        {
          id: createId('log'),
          type: 'created',
          message: 'Item created in To do.',
          createdAt: now,
        },
      ],
    }

    kanbanItems = [...kanbanItems, item]

    return HttpResponse.json<KanbanItemResponse>({ item }, { status: 201 })
  }),

  http.patch('/api/kanban/items/:itemId', async ({ params, request }) => {
    await delay(MOCK_DELAY_IN_MS)

    const itemId = String(params.itemId)
    const itemIndex = kanbanItems.findIndex((item) => item.id === itemId)

    if (itemIndex === -1) {
      return jsonError('Item not found.', 404)
    }

    const input = (await request.json()) as KanbanItemPatchInput
    const updatedItem = updateMutableFields(kanbanItems[itemIndex], input, getNow())

    if (typeof updatedItem === 'string') {
      return jsonError(updatedItem)
    }

    kanbanItems = kanbanItems.map((item) => (item.id === itemId ? updatedItem : item))

    return HttpResponse.json<KanbanItemResponse>({ item: updatedItem })
  }),
]
