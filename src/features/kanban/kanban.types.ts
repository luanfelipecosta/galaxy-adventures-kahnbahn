export type KanbanStatus = 'to-do' | 'doing' | 'done'

export type KanbanPriority = 'low' | 'medium' | 'high'

export type KanbanDropEdge = 'before' | 'after'

export type KanbanColumn = {
  id: KanbanStatus
  title: string
  acceptsFrom: KanbanStatus[]
  order: number
}

export type KanbanItemLogType = 'created' | 'status' | 'updated' | 'manual'

export type KanbanItemLog = {
  id: string
  type: KanbanItemLogType
  message: string
  createdAt: string
  fromStatus?: KanbanStatus
  toStatus?: KanbanStatus
}

export type KanbanItem = {
  id: string
  title: string
  descriptionMarkdown: string
  assigneeId: string | null
  status: KanbanStatus
  position: number
  priority: KanbanPriority
  labels: string[]
  createdAt: string
  updatedAt: string
  logs: KanbanItemLog[]
}

export type KanbanAssignee = {
  id: string
  name: string
  image: string | null
}

export type KanbanAssigneeFilter = 'all' | 'unassigned' | string

export type KanbanItemCreateInput = {
  title: string
  descriptionMarkdown: string
  assigneeId: string | null
  priority: KanbanPriority
  labels: string[]
}

export type KanbanItemPatchInput = Partial<
  Pick<
    KanbanItem,
    'title' | 'descriptionMarkdown' | 'assigneeId' | 'status' | 'position' | 'priority' | 'labels'
  >
> & {
  manualLog?: {
    message: string
  }
}

export type KanbanItemsResponse = {
  items: KanbanItem[]
}

export type KanbanItemResponse = {
  item: KanbanItem
}

export type KanbanItemsByStatus = Record<KanbanStatus, KanbanItem[]>
