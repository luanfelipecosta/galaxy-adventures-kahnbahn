import { KanbanBoardControlBar } from './kanban-board-control-bar'
import { KanbanBoardContent } from './kanban-board-content'
import { KanbanDoneCelebration } from './kanban-done-celebration'
import { KanbanItemFormDialog } from './kanban-item-form-dialog'
import { useKanbanBoardView } from './use-kanban-board-view'

export const KanbanBoard = () => {
  const board = useKanbanBoardView()

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      <div className="grid gap-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">Workspace</p>
          <h1 className="mt-2 text-xl font-semibold tracking-normal">Galaxy Adventures Kanban</h1>
        </div>

        <KanbanBoardControlBar
          assigneeFilter={board.assigneeFilter}
          assigneeSearch={board.assigneeSearch}
          assignees={board.orderedAssignees}
          isAssigneeFilterOpen={board.isAssigneeFilterOpen}
          isAssigneeLoading={board.isAssigneeLoading}
          isAssigneeError={board.isAssigneeError}
          isPriorityFilterOpen={board.isPriorityFilterOpen}
          priorityFilter={board.priorityFilter}
          onCreateClick={() => board.setCreateOpen(true)}
          onAssigneeFilterOpenChange={board.setAssigneeFilterOpen}
          onAssigneeFilterChange={board.setAssigneeFilter}
          onAssigneeSearchChange={board.setAssigneeSearch}
          onPriorityFilterOpenChange={board.setPriorityFilterOpen}
          onPriorityFilterChange={board.setPriorityFilter}
        />
      </div>

      {board.isError && board.errorMessage ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {board.errorMessage}
        </div>
      ) : null}

      <KanbanBoardContent
        activeDragItemId={board.activeDragItemId}
        assigneesById={board.assigneesById}
        hasActiveFilters={board.hasActiveFilters}
        isAssignedAssigneesLoading={board.isAssignedAssigneesLoading}
        isLoading={board.isLoading}
        items={board.items}
        itemsByStatus={board.itemsByStatus}
        visibleItems={board.visibleItems}
        onEditItem={board.setEditingItem}
        onMoveItem={board.handleMove}
        onDragEnd={board.handleDragEnd}
        onDragStart={board.handleDragStart}
      />

      <KanbanItemFormDialog
        mode="create"
        open={board.isCreateOpen}
        isSaving={board.isSaving}
        assignedAssignees={board.orderedAssignees}
        onOpenChange={board.setCreateOpen}
        onCreate={board.createItem}
        onUpdate={board.updateItem}
      />

      <KanbanItemFormDialog
        item={board.editingItem}
        mode="edit"
        open={Boolean(board.editingItem)}
        isSaving={board.isSaving}
        assignedAssignees={board.orderedAssignees}
        onOpenChange={(open) => {
          if (!open) {
            board.setEditingItem(null)
          }
        }}
        onCreate={board.createItem}
        onUpdate={board.updateItem}
      />

      {board.doneCelebrationKey ? (
        <KanbanDoneCelebration eventKey={board.doneCelebrationKey} onComplete={board.handleDoneCelebrationComplete} />
      ) : null}
    </div>
  )
}
