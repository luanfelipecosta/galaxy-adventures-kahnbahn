import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useCharactersByIdsQuery, useCharactersQuery } from '@/lib/react-query/queries'

import type { PriorityFilter } from './kanban-board-control-bar'
import type { KanbanBoardViewModel } from './kanban-board.types'
import type { KanbanAssigneeFilter, KanbanItem, KanbanStatus } from './kanban.types'
import { getPositionForIndex, groupKanbanItemsByStatus, mergeAssigneesById, normalizeCharacterAssignees, sortAssigneesForBoard } from './kanban.utils'
import { useKanbanBoard } from './use-kanban-board'

const getSaveErrorToastMessage = (error: unknown) => {
  const apiMessage = error instanceof Error ? error.message.trim() : ''

  return apiMessage && apiMessage !== 'Something went wrong.'
    ? `Couldn't save item. ${apiMessage}`
    : "Couldn't save item. Try again."
}

const allowsDoneCelebration = () => {
  return typeof window === 'undefined' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const useKanbanBoardView = (): KanbanBoardViewModel => {
  const { items, errorMessage, isError, isLoading, isSaving, createItem, updateItem } = useKanbanBoard()
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [isPriorityFilterOpen, setPriorityFilterOpen] = useState(false)
  const [isAssigneeFilterOpen, setAssigneeFilterOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KanbanItem | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<KanbanAssigneeFilter>('all')
  const [assigneeSearch, setAssigneeSearch] = useState('')
  const [activeDragItemId, setActiveDragItemId] = useState<string | null>(null)
  const [doneCelebrationKey, setDoneCelebrationKey] = useState<number | null>(null)

  const assignedAssigneeIds = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map((item) => item.assigneeId.trim())
          .filter((assigneeId) => assigneeId.length > 0),
      ),
    ).sort((firstId, secondId) => firstId.localeCompare(secondId))
  }, [items])

  const assignedCharactersQuery = useCharactersByIdsQuery({ ids: assignedAssigneeIds })
  const searchedCharactersQuery = useCharactersQuery({
    page: 1,
    name: assigneeSearch.trim() || undefined,
  })

  const assigneesById = useMemo(() => {
    return mergeAssigneesById(
      normalizeCharacterAssignees(assignedCharactersQuery.data?.charactersByIds),
      normalizeCharacterAssignees(searchedCharactersQuery.data?.characters?.results),
    )
  }, [assignedCharactersQuery.data, searchedCharactersQuery.data])

  const orderedAssignees = useMemo(() => {
    return sortAssigneesForBoard(Array.from(assigneesById.values()), items)
  }, [assigneesById, items])

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter
      const matchesAssignee = assigneeFilter === 'all' || item.assigneeId === assigneeFilter

      return matchesPriority && matchesAssignee
    })
  }, [assigneeFilter, items, priorityFilter])

  const itemsByStatus = useMemo(() => groupKanbanItemsByStatus(visibleItems), [visibleItems])

  const handleDragStart = (item: KanbanItem) => {
    setActiveDragItemId(item.id)
  }

  const handleDragEnd = () => {
    setActiveDragItemId(null)
  }

  const showDoneFeedback = () => {
    toast.success('Congratulations, another day, another adventure, Morty.')

    if (allowsDoneCelebration()) {
      setDoneCelebrationKey(Date.now())
    }
  }

  const createItemWithFeedback = async (input: Parameters<typeof createItem>[0]) => {
    try {
      const createdItem = await createItem(input)
      toast.success('Item saved.')

      return createdItem
    } catch (error) {
      toast.error(getSaveErrorToastMessage(error))
      throw error
    }
  }

  const updateItemWithFeedback = async (itemId: string, input: Parameters<typeof updateItem>[1]) => {
    const previousItem = items.find((item) => item.id === itemId)

    try {
      const updatedItem = await updateItem(itemId, input)

      if (previousItem?.status !== 'done' && updatedItem.status === 'done') {
        showDoneFeedback()
      } else {
        toast.success('Item saved.')
      }

      return updatedItem
    } catch (error) {
      toast.error(getSaveErrorToastMessage(error))
      throw error
    }
  }

  const handleDoneCelebrationComplete = () => {
    setDoneCelebrationKey(null)
  }

  const handleMove = async (itemId: string, status: KanbanStatus, index: number) => {
    const previousItem = items.find((item) => item.id === itemId)
    const targetItems = itemsByStatus[status].filter((item) => item.id !== itemId)
    const position = getPositionForIndex(targetItems, index)

    setActiveDragItemId(null)

    try {
      const updatedItem = await updateItem(itemId, { position, status })

      if (previousItem?.status !== 'done' && updatedItem.status === 'done') {
        showDoneFeedback()
      }
    } catch (error) {
      toast.error(getSaveErrorToastMessage(error))
    }
  }

  return {
    activeDragItemId,
    assigneeFilter,
    assigneeSearch,
    assigneesById,
    createItem: createItemWithFeedback,
    doneCelebrationKey,
    editingItem,
    errorMessage,
    handleDoneCelebrationComplete,
    handleDragEnd,
    handleDragStart,
    handleMove,
    hasActiveFilters: priorityFilter !== 'all' || assigneeFilter !== 'all',
    isAssigneeError: assignedCharactersQuery.isError || searchedCharactersQuery.isError,
    isAssigneeFilterOpen,
    isAssigneeLoading: assignedCharactersQuery.isFetching || searchedCharactersQuery.isFetching,
    isAssignedAssigneesLoading: assignedCharactersQuery.isFetching,
    isCreateOpen,
    isError,
    isLoading,
    isPriorityFilterOpen,
    isSaving,
    items,
    itemsByStatus,
    orderedAssignees,
    priorityFilter,
    setAssigneeFilter,
    setAssigneeFilterOpen,
    setAssigneeSearch,
    setCreateOpen,
    setEditingItem,
    setPriorityFilter,
    setPriorityFilterOpen,
    updateItem: updateItemWithFeedback,
    visibleItems,
  }
}
