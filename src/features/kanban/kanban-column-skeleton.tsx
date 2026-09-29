import { Skeleton } from '@/components/ui/skeleton'

import { KanbanCardSkeleton } from './kanban-card-skeleton'
import type { KanbanColumn as KanbanColumnType } from './kanban.types'

type KanbanColumnSkeletonProps = {
  column: KanbanColumnType
}

export const KanbanColumnSkeleton = ({ column }: KanbanColumnSkeletonProps) => {
  return (
    <section
      className="flex h-full min-h-[32rem] w-full min-w-0 shrink-0 snap-center flex-col overflow-hidden rounded-lg border border-border bg-muted/25 md:shrink"
      aria-labelledby={`kanban-column-${column.id}-loading`}
      aria-busy="true"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 id={`kanban-column-${column.id}-loading`} className="text-sm font-semibold">
          {column.title}
        </h2>
        <Skeleton className="h-6 w-8" />
      </header>

      <div className="grid min-w-0 flex-1 content-start gap-3 overflow-hidden p-3">
        <KanbanCardSkeleton />
        <KanbanCardSkeleton />
        <KanbanCardSkeleton />
      </div>
    </section>
  )
}
