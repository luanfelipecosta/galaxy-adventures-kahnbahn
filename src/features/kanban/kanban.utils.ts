import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types'

import {
  KANBAN_CARD_DROP_TARGET_DATA_TYPE,
  KANBAN_COLUMNS,
  KANBAN_COLUMN_DROP_TARGET_DATA_TYPE,
  KANBAN_DRAG_DATA_TYPE,
  KANBAN_STATUSES,
} from './kanban.constants'

import type { KanbanAssignee, KanbanDropEdge, KanbanItem, KanbanItemsByStatus, KanbanStatus } from './kanban.types'

export type KanbanCardDragData = {
  type: typeof KANBAN_DRAG_DATA_TYPE
  itemId: string
  status: KanbanStatus
}

export type KanbanCardDropTargetData = {
  type: typeof KANBAN_CARD_DROP_TARGET_DATA_TYPE
  edge: KanbanDropEdge
  itemId: string
  status: KanbanStatus
}

export type KanbanColumnDropTargetData = {
  type: typeof KANBAN_COLUMN_DROP_TARGET_DATA_TYPE
  status: KanbanStatus
}

export const isKanbanStatus = (value: unknown): value is KanbanStatus => {
  return typeof value === 'string' && KANBAN_STATUSES.includes(value as KanbanStatus)
}

export const canMoveItem = (fromStatus: KanbanStatus, toStatus: KanbanStatus) => {
  if (fromStatus === toStatus) {
    return true
  }

  const targetColumn = KANBAN_COLUMNS.find((column) => column.id === toStatus)

  return Boolean(targetColumn?.acceptsFrom.includes(fromStatus))
}

export const getColumnByStatus = (status: KanbanStatus) => {
  return KANBAN_COLUMNS.find((column) => column.id === status)
}

export const isKanbanCardDragData = (data: Record<string, unknown>): data is KanbanCardDragData => {
  return data.type === KANBAN_DRAG_DATA_TYPE && typeof data.itemId === 'string' && isKanbanStatus(data.status)
}

export const isKanbanCardDropTargetData = (data: Record<string | symbol, unknown>): data is KanbanCardDropTargetData => {
  return (
    data.type === KANBAN_CARD_DROP_TARGET_DATA_TYPE &&
    typeof data.itemId === 'string' &&
    isKanbanStatus(data.status) &&
    (data.edge === 'before' || data.edge === 'after')
  )
}

export const isKanbanColumnDropTargetData = (data: Record<string | symbol, unknown>): data is KanbanColumnDropTargetData => {
  return data.type === KANBAN_COLUMN_DROP_TARGET_DATA_TYPE && isKanbanStatus(data.status)
}

export const getKanbanDropEdgeFromHitboxEdge = (edge: Edge | null): KanbanDropEdge => {
  return edge === 'bottom' ? 'after' : 'before'
}

export const getHitboxEdgeFromKanbanDropEdge = (edge: KanbanDropEdge): Edge => {
  return edge === 'after' ? 'bottom' : 'top'
}

export const getSnappedKanbanDropEdge = ({
  clientY,
  element,
  fallbackEdge,
  previousEdge,
}: {
  clientY: number
  element: Element
  fallbackEdge: KanbanDropEdge
  previousEdge: KanbanDropEdge | null
}): KanbanDropEdge => {
  const rect = element.getBoundingClientRect()
  const offsetY = clientY - rect.top
  const center = rect.height / 2
  const deadZoneRadius = Math.min(Math.max(rect.height * 0.16, 12), 32)

  if (offsetY < center - deadZoneRadius) {
    return 'before'
  }

  if (offsetY > center + deadZoneRadius) {
    return 'after'
  }

  return previousEdge ?? fallbackEdge
}

export const sortKanbanItemsByPosition = (items: KanbanItem[]) => {
  return [...items].sort((firstItem, secondItem) => {
    if (firstItem.position === secondItem.position) {
      return firstItem.createdAt.localeCompare(secondItem.createdAt)
    }

    return firstItem.position - secondItem.position
  })
}

export const groupKanbanItemsByStatus = (items: KanbanItem[]): KanbanItemsByStatus => {
  return KANBAN_STATUSES.reduce<KanbanItemsByStatus>(
    (groups, status) => {
      groups[status] = sortKanbanItemsByPosition(items.filter((item) => item.status === status))

      return groups
    },
    {
      'to-do': [],
      doing: [],
      done: [],
    },
  )
}

export const getNextPosition = (items: KanbanItem[], status: KanbanStatus) => {
  const positions = items.filter((item) => item.status === status).map((item) => item.position)

  return positions.length > 0 ? Math.max(...positions) + 1000 : 1000
}

export const getPositionForIndex = (items: KanbanItem[], index: number) => {
  const sortedItems = sortKanbanItemsByPosition(items)
  const previousItem = sortedItems[index - 1]
  const nextItem = sortedItems[index]

  if (!previousItem && !nextItem) {
    return 1000
  }

  if (!previousItem && nextItem) {
    return nextItem.position - 1000
  }

  if (previousItem && !nextItem) {
    return previousItem.position + 1000
  }

  return (previousItem.position + nextItem.position) / 2
}

export const normalizeLabels = (value: string) => {
  const labels = value
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean)

  return Array.from(new Set(labels))
}

export const getAssigneeInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return '?'
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export const normalizeCharacterAssignees = (
  characters: Array<{ id: string | null; name: string | null; image: string | null } | null> | null | undefined,
): KanbanAssignee[] => {
  return (characters ?? []).reduce<KanbanAssignee[]>((assignees, character) => {
    if (!character?.id || !character.name) {
      return assignees
    }

    assignees.push({
      id: character.id,
      name: character.name,
      image: character.image ?? null,
    })

    return assignees
  }, [])
}

export const mergeAssigneesById = (...assigneeGroups: KanbanAssignee[][]) => {
  return assigneeGroups.reduce<Map<string, KanbanAssignee>>((assigneeMap, assignees) => {
    assignees.forEach((assignee) => {
      assigneeMap.set(assignee.id, assignee)
    })

    return assigneeMap
  }, new Map<string, KanbanAssignee>())
}

export const sortAssigneesForBoard = (assignees: KanbanAssignee[], items: KanbanItem[]) => {
  const assignedIds = new Set(items.map((item) => item.assigneeId).filter((assigneeId): assigneeId is string => Boolean(assigneeId)))

  return [...assignees].sort((firstAssignee, secondAssignee) => {
    const firstHasAssignedItems = assignedIds.has(firstAssignee.id)
    const secondHasAssignedItems = assignedIds.has(secondAssignee.id)

    if (firstHasAssignedItems !== secondHasAssignedItems) {
      return firstHasAssignedItems ? -1 : 1
    }

    return firstAssignee.name.localeCompare(secondAssignee.name)
  })
}

export const formatPriority = (priority: KanbanItem['priority']) => {
  return `${priority.slice(0, 1).toUpperCase()}${priority.slice(1)}`
}

export const formatStatus = (status: KanbanStatus) => {
  return getColumnByStatus(status)?.title ?? status
}
