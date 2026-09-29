import type {
  KanbanAssignee,
  KanbanAssigneeFilter,
  KanbanItem,
  KanbanItemCreateInput,
  KanbanItemPatchInput,
  KanbanItemsByStatus,
  KanbanPriority,
  KanbanStatus,
} from '../model/kanban.types'

export type PriorityFilter = KanbanPriority | 'all'

export type KanbanBoardUiState = {
  activeDragItemId: string | null
  assigneeFilter: KanbanAssigneeFilter
  assigneeSearch: string
  doneCelebrationKey: number | null
  editingItem: KanbanItem | null
  isAssigneeFilterOpen: boolean
  isCreateOpen: boolean
  isPriorityFilterOpen: boolean
  priorityFilter: PriorityFilter
}

export type KanbanBoardState = KanbanBoardUiState & {
  assigneesById: Map<string, KanbanAssignee>
  errorMessage: string | null
  hasActiveFilters: boolean
  isAssigneeError: boolean
  isAssigneeLoading: boolean
  isAssignedAssigneesLoading: boolean
  isError: boolean
  isLoading: boolean
  isSaving: boolean
  items: KanbanItem[]
  itemsByStatus: KanbanItemsByStatus
  orderedAssignees: KanbanAssignee[]
  visibleItems: KanbanItem[]
}

export type KanbanBoardActions = {
  createItem: (input: KanbanItemCreateInput) => Promise<KanbanItem>
  completeDoneCelebration: () => void
  editItem: (item: KanbanItem | null) => void
  moveItem: (itemId: string, status: KanbanStatus, index: number) => void
  setAssigneeFilter: (assigneeFilter: KanbanAssigneeFilter) => void
  setAssigneeFilterOpen: (isOpen: boolean) => void
  setAssigneeSearch: (search: string) => void
  setCreateOpen: (isOpen: boolean) => void
  setPriorityFilter: (priorityFilter: PriorityFilter) => void
  setPriorityFilterOpen: (isOpen: boolean) => void
  startDraggingItem: (item: Pick<KanbanItem, 'id'>) => void
  stopDraggingItem: () => void
  updateItem: (itemId: string, input: KanbanItemPatchInput) => Promise<KanbanItem>
}
