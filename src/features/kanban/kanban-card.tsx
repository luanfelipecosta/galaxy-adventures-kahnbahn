import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/attach-closest-edge'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/utils/combine'
import { Edit3Icon, GripVerticalIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { KANBAN_CARD_DROP_TARGET_DATA_TYPE, KANBAN_DRAG_DATA_TYPE } from './kanban.constants'
import type { KanbanAssignee, KanbanDropEdge, KanbanItem } from './kanban.types'
import {
  canMoveItem,
  formatPriority,
  getKanbanDropEdgeFromHitboxEdge,
  getSnappedKanbanDropEdge,
  isKanbanCardDragData,
  isKanbanCardDropTargetData,
} from './kanban.utils'
import { KanbanAssigneeAvatar } from './kanban-assignee-avatar'

type KanbanCardProps = {
  assignee: KanbanAssignee | null
  index: number
  isDragSource: boolean
  item: KanbanItem
  onDragEnd: () => void
  onDragStart: (item: KanbanItem) => void
  onEdit: (item: KanbanItem) => void
}

const priorityClassNames: Record<KanbanItem['priority'], string> = {
  low: 'border-success/40 bg-success/10 text-success-foreground',
  medium: 'border-primary/35 bg-primary/10 text-primary-foreground',
  high: 'border-destructive/35 bg-destructive/10 text-destructive',
}

export const KanbanCard = ({
  assignee,
  index,
  isDragSource,
  item,
  onDragEnd,
  onDragStart,
  onEdit,
}: KanbanCardProps) => {
  const cardRef = useRef<HTMLElement | null>(null)
  const lastEdgeRef = useRef<KanbanDropEdge | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dropEdge, setDropEdge] = useState<KanbanDropEdge | null>(null)
  const description = item.descriptionMarkdown.trim() || 'No description'
  const assigneeName = assignee?.name ?? (item.assigneeId ? 'Unknown assignee' : 'Unassigned')

  useEffect(() => {
    const element = cardRef.current

    if (!element) {
      return undefined
    }

    return combine(
      draggable({
        element,
        getInitialData: () => ({
          type: KANBAN_DRAG_DATA_TYPE,
          itemId: item.id,
          status: item.status,
        }),
        onDragStart: () => {
          lastEdgeRef.current = null
          onDragStart(item)
          setIsDragging(true)
        },
        onDrop: () => {
          lastEdgeRef.current = null
          setIsDragging(false)
          onDragEnd()
        },
      }),
      dropTargetForElements({
        element,
        getData: ({ input }) => {
          const data = attachClosestEdge(
            {
              type: KANBAN_CARD_DROP_TARGET_DATA_TYPE,
              itemId: item.id,
              status: item.status,
            },
            {
              allowedEdges: ['top', 'bottom'],
              element,
              input,
            },
          )
          const fallbackEdge = getKanbanDropEdgeFromHitboxEdge(extractClosestEdge(data))
          const edge = getSnappedKanbanDropEdge({
            clientY: input.clientY,
            element,
            fallbackEdge,
            previousEdge: lastEdgeRef.current,
          })

          lastEdgeRef.current = edge

          return {
            ...data,
            edge,
          }
        },
        canDrop: ({ source }) => {
          return (
            isKanbanCardDragData(source.data) &&
            source.data.itemId !== item.id &&
            canMoveItem(source.data.status, item.status)
          )
        },
        onDrag: ({ self, source }) => {
          if (
            !isKanbanCardDragData(source.data) ||
            !isKanbanCardDropTargetData(self.data)
          ) {
            return
          }

          setDropEdge(self.data.edge)
        },
        onDragEnter: ({ self, source }) => {
          if (
            !isKanbanCardDragData(source.data) ||
            !isKanbanCardDropTargetData(self.data)
          ) {
            return
          }

          setDropEdge(self.data.edge)
        },
        onDragLeave: () => setDropEdge(null),
        onDrop: () => setDropEdge(null),
      }),
    )
  }, [item, onDragEnd, onDragStart])

  return (
    <article
      ref={cardRef}
      className="relative flex h-44 w-full min-w-0 flex-col gap-2 overflow-hidden rounded-lg border border-border bg-card p-4 text-card-foreground shadow-[var(--shadow-card-soft)] transition-[background-color,border-color,box-shadow,opacity,transform] duration-200 ease-[var(--ease-out-quart)] before:pointer-events-none before:absolute before:left-0 before:right-0 before:z-10 before:h-0.5 before:rounded-full before:bg-primary before:opacity-0 before:content-[''] after:pointer-events-none after:absolute after:left-0 after:right-0 after:z-10 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 after:content-[''] hover:border-primary/25 data-[dragging=true]:border-dashed data-[dragging=true]:border-primary/35 data-[dragging=true]:bg-card/55 data-[dragging=true]:opacity-40 data-[dragging=true]:shadow-inner data-[drop-edge=before]:before:-top-2 data-[drop-edge=before]:before:opacity-100 data-[drop-edge=after]:after:-bottom-2 data-[drop-edge=after]:after:opacity-100"
      data-dragging={isDragging || isDragSource}
      data-drop-edge={dropEdge ?? undefined}
      data-flip-id={item.id}
      aria-posinset={index + 1}
    >
      <div className="flex min-h-0 flex-1 items-start gap-3">
        <GripVerticalIcon
          className="mt-0.5 size-4 shrink-0 cursor-grab text-muted-foreground"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="block max-w-full cursor-pointer truncate text-left text-sm font-semibold leading-5 transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => onEdit(item)}
            title={item.title}
          >
            {item.title}
          </button>
          <p className="mt-1 line-clamp-2 whitespace-pre-line break-words text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => onEdit(item)}
          aria-label={`Edit ${item.title}`}
        >
          <Edit3Icon className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="ml-7 flex min-w-0 flex-wrap gap-1.5">
        {item.labels.map((label) => {
          return (
            <span
              key={label}
              className="max-w-full truncate rounded-md border border-border bg-secondary px-2 py-1 text-[0.7rem] text-muted-foreground"
            >
              {label}
            </span>
          )
        })}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 text-xs">
        <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
          <KanbanAssigneeAvatar assignee={assignee} name={assigneeName} />
          <span className="min-w-0 truncate">{assigneeName}</span>
        </span>
        <span
          className={`rounded-md border px-2 py-1 font-medium ${priorityClassNames[item.priority]}`}
        >
          {formatPriority(item.priority)}
        </span>
      </div>
    </article>
  )
}
