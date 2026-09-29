import { useMemo, useState } from 'react'

import { useCharactersByIdsQuery, useCharactersQuery } from '@/lib/react-query/queries'

import { KANBAN_COLUMNS } from './kanban.constants'
import type { KanbanAssigneeFilter, KanbanItem, KanbanItemCreateInput, KanbanItemPatchInput, KanbanStatus } from './kanban.types'
import { getPositionForIndex, groupKanbanItemsByStatus, mergeAssigneesById, normalizeCharacterAssignees, sortAssigneesForBoard } from './kanban.utils'
import { useKanbanBoard } from './use-kanban-board'
import { KanbanBoardControlBar } from './kanban-board-control-bar'
import type { PriorityFilter } from './kanban-board-control-bar'
import { KanbanColumn } from './kanban-column'
import { KanbanItemFormDialog } from './kanban-item-form-dialog'

export const KanbanBoard = () => {
  const { items, errorMessage, isError, isLoading, isSaving, createItem, updateItem } = useKanbanBoard()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isPriorityFilterOpen, setIsPriorityFilterOpen] = useState(false)
  const [isAssigneeFilterOpen, setIsAssigneeFilterOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KanbanItem | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<KanbanAssigneeFilter>('all')
  const [assigneeSearch, setAssigneeSearch] = useState('')
  const [activeDragItemId, setActiveDragItemId] = useState<string | null>(null)
  const assignedAssigneeIds = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.assigneeId).filter((assigneeId): assigneeId is string => Boolean(assigneeId))))
  }, [items])
  const assignedCharactersQuery = useCharactersByIdsQuery({ ids: assignedAssigneeIds })
  const searchedCharactersQuery = useCharactersQuery({
    page: 1,
    name: assigneeSearch.trim() || undefined,
  })
  const assigneesById = useMemo(() => {
    return mergeAssigneesById(
      normalizeCharacterAssignees(assignedCharactersQuery.data?.charactersByIds),
      normalizeCharacterAssignees(searchedCharactersQuery.data?.characters?.results),
    )
  }, [assignedCharactersQuery.data, searchedCharactersQuery.data])
  const orderedAssignees = useMemo(() => {
    return sortAssigneesForBoard(Array.from(assigneesById.values()), items)
  }, [assigneesById, items])
  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter
      const matchesAssignee =
        assigneeFilter === 'all' ||
        (assigneeFilter === 'unassigned' ? item.assigneeId === null : item.assigneeId === assigneeFilter)

      return matchesPriority && matchesAssignee
    })
  }, [assigneeFilter, items, priorityFilter])
  const itemsByStatus = useMemo(() => groupKanbanItemsByStatus(visibleItems), [visibleItems])
  const handleCreate = async (input: KanbanItemCreateInput) => {
    await createItem(input)
  }

  const handleUpdate = async (itemId: string, input: KanbanItemPatchInput) => {
    await updateItem(itemId, input)
  }

  const handleDragStart = (item: KanbanItem) => {
    setActiveDragItemId(item.id)
  }

  const handleDragEnd = () => {
    setActiveDragItemId(null)
  }

  const handleMove = (itemId: string, status: KanbanStatus, index: number) => {
    const targetItems = itemsByStatus[status].filter((item) => item.id !== itemId)
    const position = getPositionForIndex(targetItems, index)

    setActiveDragItemId(null)
    updateItem(itemId, { position, status })
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      <div className="grid gap-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">Workspace</p>
          <h1 className="mt-2 text-xl font-semibold tracking-normal">Galaxy Adventures Kanban</h1>
        </div>

        <KanbanBoardControlBar
          assigneeFilter={assigneeFilter}
          assigneeSearch={assigneeSearch}
          assignees={orderedAssignees}
          isAssigneeFilterOpen={isAssigneeFilterOpen}
          isAssigneeLoading={assignedCharactersQuery.isPending || searchedCharactersQuery.isFetching}
          isAssigneeError={assignedCharactersQuery.isError || searchedCharactersQuery.isError}
          isPriorityFilterOpen={isPriorityFilterOpen}
          priorityFilter={priorityFilter}
          onCreateClick={() => setIsCreateOpen(true)}
          onAssigneeFilterOpenChange={setIsAssigneeFilterOpen}
          onAssigneeFilterChange={setAssigneeFilter}
          onAssigneeSearchChange={setAssigneeSearch}
          onPriorityFilterOpenChange={setIsPriorityFilterOpen}
          onPriorityFilterChange={setPriorityFilter}
        />
      </div>

      {isError && errorMessage ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid flex-1 gap-3 md:grid-cols-3">
          {KANBAN_COLUMNS.map((column) => {
            return <div key={column.id} className="min-h-96 rounded-lg border border-border bg-muted/20" />
          })}
        </div>
      ) : (
        <div className="-mx-5 min-h-0 flex-1 overflow-x-auto scroll-px-5 snap-x snap-mandatory px-5 pb-3 sm:-mx-8 sm:scroll-px-8 sm:px-8 md:mx-0 md:px-0">
          <div className="flex h-full gap-4 md:grid md:min-w-[calc(900px+2.5rem)] md:grid-cols-[repeat(3,minmax(300px,1fr))] md:gap-5 lg:min-w-0">
            {KANBAN_COLUMNS.map((column) => {
              return (
                <KanbanColumn
                  key={column.id}
                  activeDragItemId={activeDragItemId}
                  assigneesById={assigneesById}
                  column={column}
                  items={itemsByStatus[column.id]}
                  onEditItem={setEditingItem}
                  onMoveItem={handleMove}
                  onDragEnd={handleDragEnd}
                  onDragStart={handleDragStart}
                />
              )
            })}
          </div>
        </div>
      )}

      <KanbanItemFormDialog
        mode="create"
        open={isCreateOpen}
        isSaving={isSaving}
        assignedAssignees={orderedAssignees}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <KanbanItemFormDialog
        item={editingItem}
        mode="edit"
        open={Boolean(editingItem)}
        isSaving={isSaving}
        assignedAssignees={orderedAssignees}
        onOpenChange={(open) => {
          if (!open) {
            setEditingItem(null)
          }
        }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </div>
  )
}
