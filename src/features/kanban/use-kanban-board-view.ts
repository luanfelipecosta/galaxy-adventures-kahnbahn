import { useMemo, useState } from 'react'

import { useCharactersByIdsQuery, useCharactersQuery } from '@/lib/react-query/queries'

import type { PriorityFilter } from './kanban-board-control-bar'
import type { KanbanBoardViewModel } from './kanban-board.types'
import type { KanbanAssigneeFilter, KanbanItem, KanbanStatus } from './kanban.types'
import { getPositionForIndex, groupKanbanItemsByStatus, mergeAssigneesById, normalizeCharacterAssignees, sortAssigneesForBoard } from './kanban.utils'
import { useKanbanBoard } from './use-kanban-board'

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

  const assignedAssigneeIds = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.assigneeId).filter((assigneeId): assigneeId is string => Boolean(assigneeId))))
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
      const matchesAssignee =
        assigneeFilter === 'all' ||
        (assigneeFilter === 'unassigned' ? item.assigneeId === null : item.assigneeId === assigneeFilter)

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

  const handleMove = (itemId: string, status: KanbanStatus, index: number) => {
    const targetItems = itemsByStatus[status].filter((item) => item.id !== itemId)
    const position = getPositionForIndex(targetItems, index)

    setActiveDragItemId(null)
    updateItem(itemId, { position, status })
  }

  return {
    activeDragItemId,
    assigneeFilter,
    assigneeSearch,
    assigneesById,
    createItem,
    editingItem,
    errorMessage,
    handleDragEnd,
    handleDragStart,
    handleMove,
    hasActiveFilters: priorityFilter !== 'all' || assigneeFilter !== 'all',
    isAssigneeError: assignedCharactersQuery.isError || searchedCharactersQuery.isError,
    isAssigneeFilterOpen,
    isAssigneeLoading: assignedCharactersQuery.isFetching || searchedCharactersQuery.isFetching,
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
    updateItem,
    visibleItems,
  }
}
