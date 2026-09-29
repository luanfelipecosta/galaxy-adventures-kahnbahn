import type { KanbanItemCreateInput, KanbanItemPatchInput, KanbanItemResponse, KanbanItemsResponse } from './kanban.types'

const getJson = async <ResponseBody>(url: string, init?: RequestInit): Promise<ResponseBody> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  const responseBody = (await response.json().catch(() => null)) as { message?: string } | null

  if (!response.ok) {
    throw new Error(responseBody?.message ?? 'Something went wrong.')
  }

  return responseBody as ResponseBody
}

export const getKanbanItems = async () => {
  const response = await getJson<KanbanItemsResponse>('/api/kanban/items')

  return response.items
}

export const createKanbanItem = async (input: KanbanItemCreateInput) => {
  const response = await getJson<KanbanItemResponse>('/api/kanban/items', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return response.item
}

export const patchKanbanItem = async (itemId: string, input: KanbanItemPatchInput) => {
  const response = await getJson<KanbanItemResponse>(`/api/kanban/items/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

  return response.item
}
