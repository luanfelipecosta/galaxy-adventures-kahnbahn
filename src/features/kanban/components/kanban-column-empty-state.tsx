import { ClipboardListIcon, SearchXIcon } from 'lucide-react'

type KanbanColumnEmptyStateProps = {
  hasActiveFilters: boolean
}

export const KanbanColumnEmptyState = ({ hasActiveFilters }: KanbanColumnEmptyStateProps) => {
  const Icon = hasActiveFilters ? SearchXIcon : ClipboardListIcon
  const message = hasActiveFilters ? 'Nothing matches here' : 'Ready for a mission'
  const detail = hasActiveFilters ? 'Try another filter to bring cards back.' : 'Drop a card here when work moves into this stage.'

  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-border bg-card/70 p-5 text-center">
      <div className="grid max-w-48 justify-items-center gap-2">
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-foreground">{message}</p>
        <p className="text-xs leading-5 text-muted-foreground">{detail}</p>
      </div>
    </div>
  )
}
