import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { toast } from 'sonner'

import { useCharactersByIdsQuery, useCharactersQuery } from '@/lib/react-query/queries'

import { useKanbanBoard } from '../hooks/use-kanban-board'
import type { KanbanAssigneeFilter, KanbanItem, KanbanStatus } from '../model/kanban.types'
import {
  getPositionForIndex,
  groupKanbanItemsByStatus,
  mergeAssigneesById,
  normalizeCharacterAssignees,
  sortAssigneesForBoard,
} from '../model/kanban.utils'
import type { KanbanBoardActions, KanbanBoardState, KanbanBoardUiState, PriorityFilter } from './kanban-board.types'

type KanbanBoardProviderProps = {
  children: ReactNode
}

type KanbanBoardUiAction =
  | { type: 'complete-done-celebration' }
  | { type: 'edit-item'; item: KanbanItem | null }
  | { type: 'set-assignee-filter'; assigneeFilter: KanbanAssigneeFilter }
  | { type: 'set-assignee-filter-open'; isOpen: boolean }
  | { type: 'set-assignee-search'; search: string }
  | { type: 'set-create-open'; isOpen: boolean }
  | { type: 'set-priority-filter'; priorityFilter: PriorityFilter }
  | { type: 'set-priority-filter-open'; isOpen: boolean }
  | { type: 'show-done-celebration'; eventKey: number }
  | { type: 'start-dragging-item'; itemId: string }
  | { type: 'stop-dragging-item' }

const initialUiState: KanbanBoardUiState = {
  activeDragItemId: null,
  assigneeFilter: 'all',
  assigneeSearch: '',
  doneCelebrationKey: null,
  editingItem: null,
  isAssigneeFilterOpen: false,
  isCreateOpen: false,
  isPriorityFilterOpen: false,
  priorityFilter: 'all',
}

const getSaveErrorToastMessage = (error: unknown) => {
  const apiMessage = error instanceof Error ? error.message.trim() : ''

  return apiMessage && apiMessage !== 'Something went wrong.'
    ? `Couldn't save item. ${apiMessage}`
    : "Couldn't save item. Try again."
}

const allowsDoneCelebration = () => {
  return typeof window === 'undefined' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const kanbanBoardUiReducer = (state: KanbanBoardUiState, action: KanbanBoardUiAction): KanbanBoardUiState => {
  switch (action.type) {
    case 'complete-done-celebration':
      return { ...state, doneCelebrationKey: null }
    case 'edit-item':
      return { ...state, editingItem: action.item }
    case 'set-assignee-filter':
      return { ...state, assigneeFilter: action.assigneeFilter }
    case 'set-assignee-filter-open':
      return {
        ...state,
        isAssigneeFilterOpen: action.isOpen,
        isPriorityFilterOpen: action.isOpen ? false : state.isPriorityFilterOpen,
      }
    case 'set-assignee-search':
      return { ...state, assigneeSearch: action.search }
    case 'set-create-open':
      return { ...state, isCreateOpen: action.isOpen }
    case 'set-priority-filter':
      return { ...state, priorityFilter: action.priorityFilter }
    case 'set-priority-filter-open':
      return {
        ...state,
        isAssigneeFilterOpen: action.isOpen ? false : state.isAssigneeFilterOpen,
        isPriorityFilterOpen: action.isOpen,
      }
    case 'show-done-celebration':
      return { ...state, doneCelebrationKey: action.eventKey }
    case 'start-dragging-item':
      return { ...state, activeDragItemId: action.itemId }
    case 'stop-dragging-item':
      return { ...state, activeDragItemId: null }
  }
}

const KanbanBoardStateContext = createContext<KanbanBoardState | null>(null)
const KanbanBoardActionsContext = createContext<KanbanBoardActions | null>(null)

export const KanbanBoardProvider = ({ children }: KanbanBoardProviderProps) => {
  const [uiState, dispatch] = useReducer(kanbanBoardUiReducer, initialUiState)
  const { items, errorMessage, isError, isLoading, isSaving, createItem, updateItem } = useKanbanBoard()

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
    name: uiState.assigneeSearch.trim() || undefined,
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
      const matchesPriority = uiState.priorityFilter === 'all' || item.priority === uiState.priorityFilter
      const matchesAssignee = uiState.assigneeFilter === 'all' || item.assigneeId === uiState.assigneeFilter

      return matchesPriority && matchesAssignee
    })
  }, [items, uiState.assigneeFilter, uiState.priorityFilter])

  const itemsByStatus = useMemo(() => groupKanbanItemsByStatus(visibleItems), [visibleItems])

  const showDoneFeedback = useCallback(() => {
    toast.success('Congratulations, another day, another adventure, Morty.')

    if (allowsDoneCelebration()) {
      dispatch({ type: 'show-done-celebration', eventKey: Date.now() })
    }
  }, [])

  const createItemWithFeedback: KanbanBoardActions['createItem'] = useCallback(
    async (input) => {
      try {
        const createdItem = await createItem(input)
        toast.success('Item saved.')

        return createdItem
      } catch (error) {
        toast.error(getSaveErrorToastMessage(error))
        throw error
      }
    },
    [createItem],
  )

  const updateItemWithFeedback: KanbanBoardActions['updateItem'] = useCallback(
    async (itemId, input) => {
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
    },
    [items, showDoneFeedback, updateItem],
  )

  const moveItem = useCallback(
    async (itemId: string, status: KanbanStatus, index: number) => {
      const previousItem = items.find((item) => item.id === itemId)
      const targetItems = itemsByStatus[status].filter((item) => item.id !== itemId)
      const position = getPositionForIndex(targetItems, index)

      dispatch({ type: 'stop-dragging-item' })

      try {
        const updatedItem = await updateItem(itemId, { position, status })

        if (previousItem?.status !== 'done' && updatedItem.status === 'done') {
          showDoneFeedback()
        }
      } catch (error) {
        toast.error(getSaveErrorToastMessage(error))
      }
    },
    [items, itemsByStatus, showDoneFeedback, updateItem],
  )

  const state = useMemo<KanbanBoardState>(() => {
    return {
      ...uiState,
      assigneesById,
      errorMessage,
      hasActiveFilters: uiState.priorityFilter !== 'all' || uiState.assigneeFilter !== 'all',
      isAssigneeError: assignedCharactersQuery.isError || searchedCharactersQuery.isError,
      isAssigneeLoading: assignedCharactersQuery.isFetching || searchedCharactersQuery.isFetching,
      isAssignedAssigneesLoading: assignedCharactersQuery.isFetching,
      isError,
      isLoading,
      isSaving,
      items,
      itemsByStatus,
      orderedAssignees,
      visibleItems,
    }
  }, [
    assignedCharactersQuery.isError,
    assignedCharactersQuery.isFetching,
    assigneesById,
    errorMessage,
    isError,
    isLoading,
    isSaving,
    items,
    itemsByStatus,
    orderedAssignees,
    searchedCharactersQuery.isError,
    searchedCharactersQuery.isFetching,
    uiState,
    visibleItems,
  ])

  const actions = useMemo<KanbanBoardActions>(() => {
    return {
      createItem: createItemWithFeedback,
      completeDoneCelebration: () => dispatch({ type: 'complete-done-celebration' }),
      editItem: (item) => dispatch({ type: 'edit-item', item }),
      moveItem,
      setAssigneeFilter: (assigneeFilter) => dispatch({ type: 'set-assignee-filter', assigneeFilter }),
      setAssigneeFilterOpen: (isOpen) => dispatch({ type: 'set-assignee-filter-open', isOpen }),
      setAssigneeSearch: (search) => dispatch({ type: 'set-assignee-search', search }),
      setCreateOpen: (isOpen) => dispatch({ type: 'set-create-open', isOpen }),
      setPriorityFilter: (priorityFilter) => dispatch({ type: 'set-priority-filter', priorityFilter }),
      setPriorityFilterOpen: (isOpen) => dispatch({ type: 'set-priority-filter-open', isOpen }),
      startDraggingItem: (item) => dispatch({ type: 'start-dragging-item', itemId: item.id }),
      stopDraggingItem: () => dispatch({ type: 'stop-dragging-item' }),
      updateItem: updateItemWithFeedback,
    }
  }, [createItemWithFeedback, moveItem, updateItemWithFeedback])

  return (
    <KanbanBoardStateContext.Provider value={state}>
      <KanbanBoardActionsContext.Provider value={actions}>{children}</KanbanBoardActionsContext.Provider>
    </KanbanBoardStateContext.Provider>
  )
}

export const useKanbanBoardState = () => {
  const state = useContext(KanbanBoardStateContext)

  if (!state) {
    throw new Error('useKanbanBoardState must be used inside KanbanBoardProvider.')
  }

  return state
}

export const useKanbanBoardActions = () => {
  const actions = useContext(KanbanBoardActionsContext)

  if (!actions) {
    throw new Error('useKanbanBoardActions must be used inside KanbanBoardProvider.')
  }

  return actions
}
