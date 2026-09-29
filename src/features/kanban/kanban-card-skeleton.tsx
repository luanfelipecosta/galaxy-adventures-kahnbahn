import { Skeleton } from '@/components/ui/skeleton'

export const KanbanCardSkeleton = () => {
  return (
    <article className="flex h-44 w-full min-w-0 flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-card-soft)]">
      <div className="flex items-start gap-3">
        <Skeleton className="mt-0.5 size-4 shrink-0 rounded-sm" />
        <div className="grid min-w-0 flex-1 gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="size-8 shrink-0" />
      </div>

      <div className="ml-7 flex gap-1.5">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>

      <div className="ml-7 mt-auto flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </article>
  )
}
