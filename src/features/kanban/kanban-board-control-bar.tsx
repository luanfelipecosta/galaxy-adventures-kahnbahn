import { CheckIcon, FilterIcon, MoreHorizontalIcon, PlusIcon, UserRoundIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'

import type { KanbanAssignee, KanbanAssigneeFilter, KanbanPriority } from './kanban.types'
import { KanbanAssigneeAvatar } from './kanban-assignee-avatar'

export type PriorityFilter = KanbanPriority | 'all'

const priorityFilterOptions: { label: string; value: PriorityFilter }[] = [
  { label: 'All priorities', value: 'all' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

type KanbanBoardControlBarProps = {
  assigneeFilter: KanbanAssigneeFilter
  assigneeSearch: string
  assignees: KanbanAssignee[]
  isAssigneeFilterOpen: boolean
  isAssigneeError: boolean
  isAssigneeLoading: boolean
  isPriorityFilterOpen: boolean
  priorityFilter: PriorityFilter
  onAssigneeFilterOpenChange: (isOpen: boolean) => void
  onAssigneeFilterChange: (assigneeFilter: KanbanAssigneeFilter) => void
  onAssigneeSearchChange: (search: string) => void
  onCreateClick: () => void
  onPriorityFilterOpenChange: (isOpen: boolean) => void
  onPriorityFilterChange: (priorityFilter: PriorityFilter) => void
}

export const KanbanBoardControlBar = ({
  assigneeFilter,
  assigneeSearch,
  assignees,
  isAssigneeFilterOpen,
  isAssigneeError,
  isAssigneeLoading,
  isPriorityFilterOpen,
  priorityFilter,
  onAssigneeFilterOpenChange,
  onAssigneeFilterChange,
  onAssigneeSearchChange,
  onCreateClick,
  onPriorityFilterOpenChange,
  onPriorityFilterChange,
}: KanbanBoardControlBarProps) => {
  const toolbarRef = useRef<HTMLDivElement | null>(null)
  const quickAssignees = assignees.slice(0, 3)
  const hasActiveAssigneeFilter = assigneeFilter !== 'all'

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node) || toolbarRef.current?.contains(target)) {
        return
      }

      onAssigneeFilterOpenChange(false)
      onPriorityFilterOpenChange(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [onAssigneeFilterOpenChange, onPriorityFilterOpenChange])

  return (
    <div
      ref={toolbarRef}
      className="relative flex flex-wrap items-center gap-3 rounded-lg bg-muted/25 p-3 shadow-[var(--shadow-card-soft)]"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onAssigneeFilterOpenChange(false)
          onPriorityFilterOpenChange(false)
        }
      }}
    >
      <button
        type="button"
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary-foreground px-4 py-2 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-[var(--ease-out-quart)] hover:bg-foreground active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        onClick={onCreateClick}
      >
        <PlusIcon className="size-4" aria-hidden="true" />
        New item
      </button>
      <div className="relative">
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-[background-color,color,transform] duration-150 ease-[var(--ease-out-quart)] hover:bg-secondary hover:text-foreground active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card data-[active=true]:border-primary/40 data-[active=true]:bg-primary/10 data-[active=true]:text-primary-foreground"
          data-active={priorityFilter !== 'all'}
          aria-expanded={isPriorityFilterOpen}
          aria-haspopup="menu"
          onClick={() => {
            onPriorityFilterOpenChange(!isPriorityFilterOpen)
            onAssigneeFilterOpenChange(false)
          }}
        >
          <FilterIcon className="size-4" aria-hidden="true" />
          Priority
        </button>

        {isPriorityFilterOpen ? (
          <div
            className="absolute left-0 top-[calc(100%+0.5rem)] z-20 grid w-48 gap-1 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-[var(--shadow-card-soft)]"
            role="menu"
            aria-label="Filter items by priority"
          >
            {priorityFilterOptions.map((option) => {
              const isSelected = priorityFilter === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  className="flex min-h-9 items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => {
                    onPriorityFilterChange(option.value)
                    onPriorityFilterOpenChange(false)
                  }}
                >
                  <span>{option.label}</span>
                  {isSelected ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      <div className="relative flex min-w-0 items-center gap-1" aria-label="Filter items by assignee">
        {quickAssignees.map((assignee) => {
          const isSelected = assigneeFilter === assignee.id

          return (
            <button
              key={assignee.id}
              type="button"
              className="-ml-2 first:ml-0 inline-flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-card bg-secondary text-xs font-semibold text-primary-foreground shadow-sm transition hover:z-10 hover:scale-105 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:border-primary"
              data-active={isSelected}
              aria-pressed={isSelected}
              title={assignee.name}
              onClick={() => {
                onAssigneeFilterChange(isSelected ? 'all' : assignee.id)
                onAssigneeFilterOpenChange(false)
              }}
            >
              <KanbanAssigneeAvatar
                assignee={assignee}
                name={assignee.name}
                className="inline-flex size-full items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-semibold text-primary-foreground"
              />
              <span className="sr-only">{assignee.name}</span>
            </button>
          )
        })}
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-[background-color,color,transform] duration-150 ease-[var(--ease-out-quart)] hover:bg-secondary hover:text-foreground active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card data-[active=true]:border-primary/40 data-[active=true]:bg-primary/10 data-[active=true]:text-primary-foreground"
          data-active={hasActiveAssigneeFilter}
          aria-expanded={isAssigneeFilterOpen}
          aria-haspopup="menu"
          onClick={() => {
            onAssigneeFilterOpenChange(!isAssigneeFilterOpen)
            onPriorityFilterOpenChange(false)
          }}
        >
          <MoreHorizontalIcon className="size-4" aria-hidden="true" />
          Assignee
        </button>

        {isAssigneeFilterOpen ? (
          <div
            className="absolute right-0 top-[calc(100%+0.5rem)] z-20 grid w-72 gap-3 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-[var(--shadow-card-soft)]"
            role="menu"
            aria-label="Filter items by assignee"
          >
            <div className="grid gap-2">
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                Assignee
                <input
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  value={assigneeSearch}
                  placeholder="Search characters"
                  onChange={(event) => onAssigneeSearchChange(event.target.value)}
                />
              </label>
              <div className="grid max-h-64 gap-1 overflow-y-auto">
                <button
                  type="button"
                  className="flex min-h-9 items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  role="menuitemradio"
                  aria-checked={assigneeFilter === 'all'}
                  onClick={() => {
                    onAssigneeFilterChange('all')
                    onAssigneeFilterOpenChange(false)
                  }}
                >
                  <span>All assignees</span>
                  {assigneeFilter === 'all' ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
                </button>
                <button
                  type="button"
                  className="flex min-h-9 items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  role="menuitemradio"
                  aria-checked={assigneeFilter === 'unassigned'}
                  onClick={() => {
                    onAssigneeFilterChange('unassigned')
                    onAssigneeFilterOpenChange(false)
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <UserRoundIcon className="size-4" aria-hidden="true" />
                    Unassigned
                  </span>
                  {assigneeFilter === 'unassigned' ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
                </button>
                {assignees.map((assignee) => {
                  const isSelected = assigneeFilter === assignee.id

                  return (
                    <button
                      key={assignee.id}
                      type="button"
                      className="flex min-h-10 items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      role="menuitemradio"
                      aria-checked={isSelected}
                      onClick={() => {
                        onAssigneeFilterChange(assignee.id)
                        onAssigneeFilterOpenChange(false)
                      }}
                    >
                      <span className="inline-flex min-w-0 items-center gap-2">
                        <span className="inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-[0.65rem] font-semibold text-primary-foreground">
                          <KanbanAssigneeAvatar
                            assignee={assignee}
                            name={assignee.name}
                            className="inline-flex size-full items-center justify-center overflow-hidden rounded-full bg-secondary text-[0.65rem] font-semibold text-primary-foreground"
                          />
                        </span>
                        <span className="min-w-0 truncate">{assignee.name}</span>
                      </span>
                      {isSelected ? <CheckIcon className="size-4 shrink-0" aria-hidden="true" /> : null}
                    </button>
                  )
                })}
                {isAssigneeLoading ? <p className="px-3 py-2 text-xs text-muted-foreground">Loading characters...</p> : null}
                {!isAssigneeLoading && assignees.length === 0 ? <p className="px-3 py-2 text-xs text-muted-foreground">No characters found.</p> : null}
                {isAssigneeError ? <p className="px-3 py-2 text-xs font-medium text-destructive">Characters could not be loaded.</p> : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
