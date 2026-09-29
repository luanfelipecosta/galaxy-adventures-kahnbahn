import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createKanbanItem, getKanbanItems, patchKanbanItem } from './kanban-api'
import { KANBAN_QUERY_KEYS } from './kanban.constants'
import type { KanbanItem, KanbanItemCreateInput, KanbanItemPatchInput } from './kanban.types'

type UpdateKanbanItemVariables = {
  itemId: string
  input: KanbanItemPatchInput
}

type KanbanItemsContext = {
  previousItems?: KanbanItem[]
}

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Something went wrong.'
}

export const useKanbanItemsQuery = () => {
  return useQuery({
    queryKey: KANBAN_QUERY_KEYS.items,
    queryFn: getKanbanItems,
  })
}

export const useKanbanBoard = () => {
  const queryClient = useQueryClient()
  const itemsQuery = useKanbanItemsQuery()

  const createMutation = useMutation({
    mutationFn: createKanbanItem,
    onSuccess: (createdItem) => {
      queryClient.setQueryData<KanbanItem[]>(KANBAN_QUERY_KEYS.items, (items = []) => {
        return [...items, createdItem]
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KANBAN_QUERY_KEYS.items })
    },
  })

  const updateMutation = useMutation<KanbanItem, Error, UpdateKanbanItemVariables, KanbanItemsContext>({
    mutationFn: ({ itemId, input }) => patchKanbanItem(itemId, input),
    onMutate: async ({ itemId, input }) => {
      await queryClient.cancelQueries({ queryKey: KANBAN_QUERY_KEYS.items })

      const previousItems = queryClient.getQueryData<KanbanItem[]>(KANBAN_QUERY_KEYS.items)

      queryClient.setQueryData<KanbanItem[]>(KANBAN_QUERY_KEYS.items, (items = []) => {
        return items.map((item) => {
          if (item.id !== itemId) {
            return item
          }

          return {
            ...item,
            ...input,
            updatedAt: new Date().toISOString(),
            logs: item.logs,
          }
        })
      })

      return { previousItems }
    },
    onSuccess: (updatedItem) => {
      queryClient.setQueryData<KanbanItem[]>(KANBAN_QUERY_KEYS.items, (items = []) => {
        return items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      })
    },
    onError: (error, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(KANBAN_QUERY_KEYS.items, context.previousItems)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KANBAN_QUERY_KEYS.items })
    },
  })

  const createItem = async (input: KanbanItemCreateInput) => {
    return createMutation.mutateAsync(input)
  }

  const updateItem = async (itemId: string, input: KanbanItemPatchInput) => {
    return updateMutation.mutateAsync({ itemId, input })
  }

  return {
    items: itemsQuery.data ?? [],
    errorMessage: itemsQuery.error ? getErrorMessage(itemsQuery.error) : null,
    isError: itemsQuery.isError,
    isLoading: itemsQuery.isPending,
    isSaving: createMutation.isPending || updateMutation.isPending,
    createItem,
    updateItem,
  }
}
