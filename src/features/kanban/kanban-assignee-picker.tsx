import { ChevronDownIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { KanbanAssigneeAvatar } from './kanban-assignee-avatar'
import { KanbanAssigneeSearchList } from './kanban-assignee-search-list'
import type { KanbanAssignee } from './kanban.types'

type KanbanAssigneePickerProps = {
  assignees: KanbanAssignee[]
  errorMessage?: string
  errorMessageId?: string
  isError: boolean
  isLoading: boolean
  search: string
  selectedAssigneeId: string
  onSearchChange: (search: string) => void
  onSelect: (assigneeId: string) => void
}

export const KanbanAssigneePicker = ({
  assignees,
  errorMessage,
  errorMessageId,
  isError,
  isLoading,
  search,
  selectedAssigneeId,
  onSearchChange,
  onSelect,
}: KanbanAssigneePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement | null>(null)
  const selectedAssignee = assignees.find((assignee) => assignee.id === selectedAssigneeId)
  const selectedName = selectedAssignee?.name ?? (selectedAssigneeId ? 'Unknown assignee' : 'Choose an assignee')

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node) || pickerRef.current?.contains(target)) {
        return
      }

      setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  return (
    <div
      ref={pickerRef}
      className="relative grid gap-1.5 text-sm font-medium"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsOpen(false)
        }
      }}
    >
      <span>Assignee</span>
      <button
        type="button"
        className={cn(
          'flex min-h-10 w-full items-center justify-between gap-3 rounded-md border border-input bg-card px-3 py-2 text-left text-sm text-foreground outline-none transition hover:bg-secondary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20',
          errorMessage && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-describedby={errorMessage ? errorMessageId : undefined}
        aria-invalid={Boolean(errorMessage)}
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <KanbanAssigneeAvatar assignee={selectedAssignee ?? null} name={selectedName} />
          <span className="min-w-0 truncate">{selectedName}</span>
        </span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
      {isOpen ? (
        <div
          className="absolute left-0 top-[calc(100%+0.5rem)] z-30 grid w-full min-w-72 gap-3 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-[var(--shadow-card-soft)]"
          role="menu"
          aria-label="Choose assignee"
        >
          <KanbanAssigneeSearchList
            assignees={assignees}
            isError={isError}
            isLoading={isLoading}
            search={search}
            selectedValue={selectedAssigneeId}
            onSearchChange={onSearchChange}
            onSelect={(assigneeId) => {
              onSelect(assigneeId)
              setIsOpen(false)
            }}
          />
        </div>
      ) : null}
      {errorMessage ? (
        <span id={errorMessageId} className="text-xs font-medium text-destructive">
          {errorMessage}
        </span>
      ) : null}
    </div>
  )
}
