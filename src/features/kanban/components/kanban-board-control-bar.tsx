import { FilterIcon, MoreHorizontalIcon, PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'

import { KanbanAssigneeSearchList } from './kanban-assignee-search-list'
import { KanbanAssigneeAvatar } from './kanban-assignee-avatar'
import { useKanbanBoardActions, useKanbanBoardState } from '../state/kanban-board-state'
import type { PriorityFilter } from '../state/kanban-board.types'

const priorityFilterOptions: { label: string; value: PriorityFilter }[] = [
  { label: 'All priorities', value: 'all' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

export const KanbanBoardControlBar = () => {
  const {
    assigneeFilter,
    assigneeSearch,
    isAssigneeError,
    isAssigneeFilterOpen,
    isAssigneeLoading,
    isPriorityFilterOpen,
    orderedAssignees,
    priorityFilter,
  } = useKanbanBoardState()
  const actions = useKanbanBoardActions()
  const quickAssignees = orderedAssignees.slice(0, 3)
  const hasActiveAssigneeFilter = assigneeFilter !== 'all'

  return (
    <div className="relative flex flex-wrap items-center gap-3 rounded-lg bg-muted/25 p-3 shadow-[var(--shadow-card-soft)]">
      <Button type="button" onClick={() => actions.setCreateOpen(true)}>
        <PlusIcon className="size-4" aria-hidden="true" />
        New item
      </Button>

      <DropdownMenu open={isPriorityFilterOpen} onOpenChange={actions.setPriorityFilterOpen}>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" data-active={priorityFilter !== 'all'}>
            <FilterIcon className="size-4" aria-hidden="true" />
            Priority
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" aria-label="Filter items by priority">
          <DropdownMenuRadioGroup
            value={priorityFilter}
            onValueChange={(value) => actions.setPriorityFilter(value as PriorityFilter)}
          >
            {priorityFilterOptions.map((option) => {
              return (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              )
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative flex min-w-0 items-center gap-1" aria-label="Filter items by assignee">
        {isAssigneeLoading && quickAssignees.length === 0 ? (
          <>
            <Skeleton className="-ml-2 first:ml-0 size-10 rounded-full border-2 border-card" />
            <Skeleton className="-ml-2 first:ml-0 size-10 rounded-full border-2 border-card" />
            <Skeleton className="-ml-2 first:ml-0 size-10 rounded-full border-2 border-card" />
          </>
        ) : null}
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
                actions.setAssigneeFilter(isSelected ? 'all' : assignee.id)
                actions.setAssigneeFilterOpen(false)
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
        <Popover open={isAssigneeFilterOpen} onOpenChange={actions.setAssigneeFilterOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="px-3" data-active={hasActiveAssigneeFilter}>
              <MoreHorizontalIcon className="size-4" aria-hidden="true" />
              Assignee
            </Button>
          </PopoverTrigger>
          <PopoverContent className="grid w-72 gap-3" align="end" aria-label="Filter items by assignee">
            <KanbanAssigneeSearchList
              allOptionLabel="All assignees"
              assignees={orderedAssignees}
              isError={isAssigneeError}
              isLoading={isAssigneeLoading}
              search={assigneeSearch}
              selectedValue={assigneeFilter}
              onSearchChange={actions.setAssigneeSearch}
              onSelect={(assigneeId) => {
                actions.setAssigneeFilter(assigneeId)
                actions.setAssigneeFilterOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
