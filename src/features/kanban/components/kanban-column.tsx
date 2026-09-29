import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/utils/combine'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { KANBAN_COLUMN_DROP_TARGET_DATA_TYPE } from '../model/kanban.constants'
import type { KanbanColumn as KanbanColumnType, KanbanDropEdge, KanbanItem, KanbanStatus } from '../model/kanban.types'
import {
  canMoveItem,
  getHitboxEdgeFromKanbanDropEdge,
  isKanbanCardDragData,
  isKanbanCardDropTargetData,
  isKanbanColumnDropTargetData,
} from '../model/kanban.utils'
import { KanbanCard } from './kanban-card'
import { KanbanColumnEmptyState } from './kanban-column-empty-state'
import { useFlipList } from '../hooks/use-flip-list'
import { useKanbanBoardActions, useKanbanBoardState } from '../state/kanban-board-state'

type KanbanColumnProps = {
  column: KanbanColumnType
  items: KanbanItem[]
}

export const KanbanColumn = ({
  column,
  items,
}: KanbanColumnProps) => {
  const { activeDragItemId, assigneesById, hasActiveFilters, isAssignedAssigneesLoading } = useKanbanBoardState()
  const { moveItem } = useKanbanBoardActions()
  const columnRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [isDraggedOver, setIsDraggedOver] = useState(false)
  const itemIdsKey = items.map((item) => item.id).join('|')
  const itemIds = useMemo(() => (itemIdsKey ? itemIdsKey.split('|') : []), [itemIdsKey])
  const itemCount = itemIds.length

  useFlipList({
    dependencies: [itemIdsKey],
    listRef,
  })

  const getInsertionIndex = useCallback((sourceItemId: string, sourceStatus: KanbanStatus, targetItemId: string, edge: KanbanDropEdge) => {
    if (sourceStatus === column.id) {
      const startIndex = itemIds.indexOf(sourceItemId)
      const targetIndex = itemIds.indexOf(targetItemId)

      if (startIndex !== -1 && targetIndex !== -1) {
        return getReorderDestinationIndex({
          axis: 'vertical',
          closestEdgeOfTarget: getHitboxEdgeFromKanbanDropEdge(edge),
          indexOfTarget: targetIndex,
          startIndex,
        })
      }
    }

    const itemIdsWithoutSource = itemIds.filter((itemId) => itemId !== sourceItemId)
    const targetIndex = itemIdsWithoutSource.indexOf(targetItemId)

    if (targetIndex === -1) {
      return itemIdsWithoutSource.length
    }

    return edge === 'before' ? targetIndex : targetIndex + 1
  }, [column.id, itemIds])

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
            moveItem(
              source.data.itemId,
              column.id,
              getInsertionIndex(source.data.itemId, source.data.status, innerMostTarget.data.itemId, innerMostTarget.data.edge),
            )

            return
          }

          if (innerMostTarget && isKanbanColumnDropTargetData(innerMostTarget.data)) {
            moveItem(source.data.itemId, column.id, itemIds.filter((itemId) => itemId !== source.data.itemId).length)
          }
        },
      }),
    )
  }, [column.id, getInsertionIndex, itemCount, itemIds, itemIdsKey, moveItem])

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
                assignee={assigneesById.get(item.assigneeId) ?? null}
                index={index}
                isAssigneeLoading={isAssignedAssigneesLoading}
                isDragSource={isDragSource}
                item={item}
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
