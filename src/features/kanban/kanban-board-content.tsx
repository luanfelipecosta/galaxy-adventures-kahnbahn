import { SearchXIcon, SparklesIcon } from 'lucide-react'

import { KANBAN_COLUMNS } from './kanban.constants'
import type { KanbanAssignee, KanbanItemsByStatus, KanbanItem, KanbanStatus } from './kanban.types'
import { KanbanColumn } from './kanban-column'
import { KanbanColumnSkeleton } from './kanban-column-skeleton'

type KanbanBoardContentProps = {
  activeDragItemId: string | null
  assigneesById: Map<string, KanbanAssignee>
  hasActiveFilters: boolean
  isLoading: boolean
  items: KanbanItem[]
  itemsByStatus: KanbanItemsByStatus
  visibleItems: KanbanItem[]
  onDragEnd: () => void
  onDragStart: (item: KanbanItem) => void
  onEditItem: (item: KanbanItem) => void
  onMoveItem: (itemId: string, status: KanbanStatus, index: number) => void
}

export const KanbanBoardContent = ({
  activeDragItemId,
  assigneesById,
  hasActiveFilters,
  isLoading,
  items,
  itemsByStatus,
  visibleItems,
  onDragEnd,
  onDragStart,
  onEditItem,
  onMoveItem,
}: KanbanBoardContentProps) => {
  if (isLoading) {
    return (
      <div className="-mx-5 min-h-0 flex-1 overflow-x-auto scroll-px-5 snap-x snap-mandatory px-5 pb-3 sm:-mx-8 sm:scroll-px-8 sm:px-8 md:mx-0 md:px-0">
        <div className="flex h-full gap-4 md:grid md:min-w-[calc(900px+2.5rem)] md:grid-cols-[repeat(3,minmax(300px,1fr))] md:gap-5 lg:min-w-0">
          {KANBAN_COLUMNS.map((column) => {
            return <KanbanColumnSkeleton key={column.id} column={column} />
          })}
        </div>
      </div>
    )
  }

  if (items.length === 0 || (hasActiveFilters && visibleItems.length === 0)) {
    const Icon = items.length === 0 ? SparklesIcon : SearchXIcon
    const title = items.length === 0 ? 'No adventures yet' : 'No cards match your filters'
    const description =
      items.length === 0
        ? 'Create the first item to start plotting the next galaxy run.'
        : 'Adjust the priority or assignee filters to widen the board.'

    return (
      <div className="grid flex-1 place-items-center rounded-lg border border-dashed border-border bg-muted/25 p-8 text-center">
        <div className="grid max-w-sm justify-items-center gap-3">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-card text-primary-foreground shadow-[var(--shadow-card-soft)]">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="grid gap-1">
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="-mx-5 min-h-0 flex-1 overflow-x-auto scroll-px-5 snap-x snap-mandatory px-5 pb-3 sm:-mx-8 sm:scroll-px-8 sm:px-8 md:mx-0 md:px-0">
      <div className="flex h-full gap-4 md:grid md:min-w-[calc(900px+2.5rem)] md:grid-cols-[repeat(3,minmax(300px,1fr))] md:gap-5 lg:min-w-0">
        {KANBAN_COLUMNS.map((column) => {
          return (
            <KanbanColumn
              key={column.id}
              activeDragItemId={activeDragItemId}
              assigneesById={assigneesById}
              column={column}
              hasActiveFilters={hasActiveFilters}
              items={itemsByStatus[column.id]}
              onEditItem={onEditItem}
              onMoveItem={onMoveItem}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
            />
          )
        })}
      </div>
    </div>
  )
}
