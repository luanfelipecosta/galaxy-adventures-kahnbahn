import { CheckIcon, UserRoundIcon } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'

import { KanbanAssigneeAvatar } from './kanban-assignee-avatar'
import type { KanbanAssignee } from './kanban.types'

type KanbanAssigneeSearchListProps = {
  assignees: KanbanAssignee[]
  isError: boolean
  isLoading: boolean
  search: string
  selectedValue: string
  allOptionLabel?: string
  onSearchChange: (search: string) => void
  onSelect: (assigneeId: string) => void
}

const optionClassName =
  'flex min-h-10 items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export const KanbanAssigneeSearchList = ({
  assignees,
  isError,
  isLoading,
  search,
  selectedValue,
  allOptionLabel,
  onSearchChange,
  onSelect,
}: KanbanAssigneeSearchListProps) => {
  return (
    <div className="grid gap-2">
      <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
        Assignee
        <input
          className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          value={search}
          placeholder="Search characters"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <div className="grid max-h-64 gap-1 overflow-y-auto">
        {allOptionLabel ? (
          <button
            type="button"
            className={optionClassName}
            role="menuitemradio"
            aria-checked={selectedValue === 'all'}
            onClick={() => onSelect('all')}
          >
            <span>{allOptionLabel}</span>
            {selectedValue === 'all' ? <CheckIcon className="size-4 shrink-0" aria-hidden="true" /> : null}
          </button>
        ) : null}
        <button
          type="button"
          className={optionClassName}
          role="menuitemradio"
          aria-checked={selectedValue === 'unassigned'}
          onClick={() => onSelect('unassigned')}
        >
          <span className="inline-flex items-center gap-2">
            <UserRoundIcon className="size-4" aria-hidden="true" />
            Unassigned
          </span>
          {selectedValue === 'unassigned' ? <CheckIcon className="size-4 shrink-0" aria-hidden="true" /> : null}
        </button>
        {isLoading ? (
          <div className="grid gap-1 px-3 py-2" aria-hidden="true">
            <div className="flex min-h-10 items-center justify-between gap-3">
              <span className="inline-flex min-w-0 items-center gap-2">
                <Skeleton className="size-6 shrink-0 rounded-full" />
                <Skeleton className="h-3 w-28" />
              </span>
              <Skeleton className="size-4" />
            </div>
            <div className="flex min-h-10 items-center justify-between gap-3">
              <span className="inline-flex min-w-0 items-center gap-2">
                <Skeleton className="size-6 shrink-0 rounded-full" />
                <Skeleton className="h-3 w-36" />
              </span>
              <Skeleton className="size-4" />
            </div>
            <div className="flex min-h-10 items-center justify-between gap-3">
              <span className="inline-flex min-w-0 items-center gap-2">
                <Skeleton className="size-6 shrink-0 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </span>
              <Skeleton className="size-4" />
            </div>
          </div>
        ) : null}
        {assignees.map((assignee) => {
          const isSelected = selectedValue === assignee.id

          return (
            <button
              key={assignee.id}
              type="button"
              className={optionClassName}
              role="menuitemradio"
              aria-checked={isSelected}
              onClick={() => onSelect(assignee.id)}
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <KanbanAssigneeAvatar assignee={assignee} name={assignee.name} />
                <span className="min-w-0 truncate">{assignee.name}</span>
              </span>
              {isSelected ? <CheckIcon className="size-4 shrink-0" aria-hidden="true" /> : null}
            </button>
          )
        })}
        {!isLoading && assignees.length === 0 ? <p className="px-3 py-2 text-xs text-muted-foreground">No characters found.</p> : null}
        {isError ? <p className="px-3 py-2 text-xs font-medium text-destructive">Characters could not be loaded.</p> : null}
      </div>
    </div>
  )
}
