import type { PriorityFilter } from './kanban-board-control-bar'
import type { KanbanAssignee, KanbanAssigneeFilter, KanbanItemsByStatus, KanbanItem, KanbanStatus } from './kanban.types'

export type KanbanBoardViewState = {
  activeDragItemId: string | null
  assigneeFilter: KanbanAssigneeFilter
  assigneeSearch: string
  assigneesById: Map<string, KanbanAssignee>
  editingItem: KanbanItem | null
  errorMessage: string | null
  hasActiveFilters: boolean
  isAssigneeError: boolean
  isAssigneeFilterOpen: boolean
  isAssigneeLoading: boolean
  isCreateOpen: boolean
  isError: boolean
  isLoading: boolean
  isPriorityFilterOpen: boolean
  isSaving: boolean
  items: KanbanItem[]
  itemsByStatus: KanbanItemsByStatus
  orderedAssignees: KanbanAssignee[]
  priorityFilter: PriorityFilter
  visibleItems: KanbanItem[]
}

export type KanbanBoardViewActions = {
  createItem: (input: import('./kanban.types').KanbanItemCreateInput) => Promise<KanbanItem>
  handleDragEnd: () => void
  handleDragStart: (item: KanbanItem) => void
  handleMove: (itemId: string, status: KanbanStatus, index: number) => void
  setAssigneeFilter: (assigneeFilter: KanbanAssigneeFilter) => void
  setAssigneeFilterOpen: (isOpen: boolean) => void
  setAssigneeSearch: (search: string) => void
  setCreateOpen: (isOpen: boolean) => void
  setEditingItem: (item: KanbanItem | null) => void
  setPriorityFilter: (priorityFilter: PriorityFilter) => void
  setPriorityFilterOpen: (isOpen: boolean) => void
  updateItem: (itemId: string, input: import('./kanban.types').KanbanItemPatchInput) => Promise<KanbanItem>
}

export type KanbanBoardViewModel = KanbanBoardViewState & KanbanBoardViewActions
