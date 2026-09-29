import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/utils/combine'
import { useEffect, useRef, useState } from 'react'

import { KANBAN_COLUMN_DROP_TARGET_DATA_TYPE } from './kanban.constants'
import type { KanbanAssignee, KanbanColumn as KanbanColumnType, KanbanDropEdge, KanbanItem, KanbanStatus } from './kanban.types'
import {
  canMoveItem,
  getHitboxEdgeFromKanbanDropEdge,
  isKanbanCardDragData,
  isKanbanCardDropTargetData,
  isKanbanColumnDropTargetData,
} from './kanban.utils'
import { KanbanCard } from './kanban-card'
import { KanbanColumnEmptyState } from './kanban-column-empty-state'
import { useFlipList } from './use-flip-list'

type KanbanColumnProps = {
  activeDragItemId: string | null
  assigneesById: Map<string, KanbanAssignee>
  column: KanbanColumnType
  hasActiveFilters: boolean
  items: KanbanItem[]
  onDragEnd: () => void
  onDragStart: (item: KanbanItem) => void
  onEditItem: (item: KanbanItem) => void
  onMoveItem: (itemId: string, status: KanbanStatus, index: number) => void
}

export const KanbanColumn = ({
  activeDragItemId,
  assigneesById,
  column,
  hasActiveFilters,
  items,
  onDragEnd,
  onDragStart,
  onEditItem,
  onMoveItem,
}: KanbanColumnProps) => {
  const columnRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [isDraggedOver, setIsDraggedOver] = useState(false)
  const animationKey = items.map((item) => item.id).join('|')

  useFlipList({
    dependencies: [animationKey],
    listRef,
  })

  const getInsertionIndex = (sourceItemId: string, sourceStatus: KanbanStatus, targetItemId: string, edge: KanbanDropEdge) => {
    if (sourceStatus === column.id) {
      const startIndex = items.findIndex((item) => item.id === sourceItemId)
      const targetIndex = items.findIndex((item) => item.id === targetItemId)

      if (startIndex !== -1 && targetIndex !== -1) {
        return getReorderDestinationIndex({
          axis: 'vertical',
          closestEdgeOfTarget: getHitboxEdgeFromKanbanDropEdge(edge),
          indexOfTarget: targetIndex,
          startIndex,
        })
      }
    }

    const itemsWithoutSource = items.filter((item) => item.id !== sourceItemId)
    const targetIndex = itemsWithoutSource.findIndex((item) => item.id === targetItemId)

    if (targetIndex === -1) {
      return itemsWithoutSource.length
    }

    return edge === 'before' ? targetIndex : targetIndex + 1
  }

  useEffect(() => {
    const element = columnRef.current

    if (!element) {
      return undefined
    }

    return combine(
      dropTargetForElements({
        element,
        getData: () => ({
          type: KANBAN_COLUMN_DROP_TARGET_DATA_TYPE,
          status: column.id,
        }),
        canDrop: ({ source }) => {
          return isKanbanCardDragData(source.data) && canMoveItem(source.data.status, column.id)
        },
        onDragEnter: ({ source }) => {
          setIsDraggedOver(true)
        },
        onDragLeave: () => {
          setIsDraggedOver(false)
        },
        onDrop: ({ location, source }) => {
          setIsDraggedOver(false)

          if (!isKanbanCardDragData(source.data)) {
            return
          }

          const [innerMostTarget] = location.current.dropTargets

          if (innerMostTarget && isKanbanCardDropTargetData(innerMostTarget.data)) {
            onMoveItem(
              source.data.itemId,
              column.id,
              getInsertionIndex(source.data.itemId, source.data.status, innerMostTarget.data.itemId, innerMostTarget.data.edge),
            )

            return
          }

          if (innerMostTarget && isKanbanColumnDropTargetData(innerMostTarget.data)) {
            onMoveItem(source.data.itemId, column.id, items.filter((item) => item.id !== source.data.itemId).length)
          }
        },
      }),
    )
  }, [column.id, items, onMoveItem])

  return (
    <section
      ref={columnRef}
      className="flex h-full min-h-[32rem] w-full min-w-0 shrink-0 snap-center flex-col overflow-hidden rounded-lg border border-border bg-muted/25 transition-[background-color,border-color] duration-200 ease-[var(--ease-out-quart)] data-[drag-over=true]:border-primary/50 data-[drag-over=true]:bg-primary/5 md:shrink"
      data-drag-over={isDraggedOver}
      aria-labelledby={`kanban-column-${column.id}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 id={`kanban-column-${column.id}`} className="text-sm font-semibold">
          {column.title}
        </h2>
        <span className="rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground">{items.length}</span>
      </header>

      <div ref={listRef} className="grid min-w-0 flex-1 content-start gap-3 overflow-y-auto overflow-x-hidden p-3">
        {items.length > 0 ? (
          items.map((item, index) => {
            const isDragSource = item.id === activeDragItemId

            return (
              <KanbanCard
                key={item.id}
                assignee={item.assigneeId ? assigneesById.get(item.assigneeId) ?? null : null}
                index={index}
                isDragSource={isDragSource}
                item={item}
                onDragEnd={onDragEnd}
                onDragStart={onDragStart}
                onEdit={onEditItem}
              />
            )
          })
        ) : (
          <KanbanColumnEmptyState hasActiveFilters={hasActiveFilters} />
        )}
      </div>
    </section>
  )
}
