import type { KanbanColumn, KanbanPriority, KanbanStatus } from './kanban.types'

export const KANBAN_STATUSES: KanbanStatus[] = ['to-do', 'doing', 'done']

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'to-do',
    title: 'To do',
    acceptsFrom: ['doing'],
    order: 1,
  },
  {
    id: 'doing',
    title: 'Doing',
    acceptsFrom: ['to-do', 'done'],
    order: 2,
  },
  {
    id: 'done',
    title: 'Done',
    acceptsFrom: ['doing'],
    order: 3,
  },
]

export const KANBAN_PRIORITIES: KanbanPriority[] = ['low', 'medium', 'high']

export const KANBAN_QUERY_KEYS = {
  items: ['kanban', 'items'] as const,
}

export const KANBAN_DRAG_DATA_TYPE = 'kanban-card'
export const KANBAN_CARD_DROP_TARGET_DATA_TYPE = 'kanban-card-drop-target'
export const KANBAN_COLUMN_DROP_TARGET_DATA_TYPE = 'kanban-column-drop-target'
