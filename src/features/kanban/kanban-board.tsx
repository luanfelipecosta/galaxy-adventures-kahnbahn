import { lazy, Suspense } from 'react'

import { KanbanBoardControlBar } from './components/kanban-board-control-bar'
import { KanbanBoardContent } from './components/kanban-board-content'
import { KanbanDoneCelebration } from './components/kanban-done-celebration'
import { KanbanBoardProvider, useKanbanBoardActions, useKanbanBoardState } from './state/kanban-board-state'

const KanbanItemFormDialog = lazy(() =>
  import('./components/kanban-item-form-dialog').then((module) => ({ default: module.KanbanItemFormDialog })),
)

const KanbanBoardDialogs = () => {
  const board = useKanbanBoardState()
  const actions = useKanbanBoardActions()

  return (
    <Suspense fallback={null}>
      <KanbanItemFormDialog
        mode="create"
        open={board.isCreateOpen}
        isSaving={board.isSaving}
        assignedAssignees={board.orderedAssignees}
        onOpenChange={actions.setCreateOpen}
        onCreate={actions.createItem}
        onUpdate={actions.updateItem}
      />

      <KanbanItemFormDialog
        item={board.editingItem}
        mode="edit"
        open={Boolean(board.editingItem)}
        isSaving={board.isSaving}
        assignedAssignees={board.orderedAssignees}
        onOpenChange={(open) => {
          if (!open) {
            actions.editItem(null)
          }
        }}
        onCreate={actions.createItem}
        onUpdate={actions.updateItem}
      />
    </Suspense>
  )
}

const KanbanBoardView = () => {
  const board = useKanbanBoardState()
  const actions = useKanbanBoardActions()

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      <div className="grid gap-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">Workspace</p>
          <h1 className="mt-2 text-xl font-semibold tracking-normal">Galaxy Adventures Kanban</h1>
        </div>

        <KanbanBoardControlBar />
      </div>

      {board.isError && board.errorMessage ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {board.errorMessage}
        </div>
      ) : null}

      <KanbanBoardContent />

      <KanbanBoardDialogs />

      {board.doneCelebrationKey ? (
        <KanbanDoneCelebration eventKey={board.doneCelebrationKey} onComplete={actions.completeDoneCelebration} />
      ) : null}
    </div>
  )
}

export const KanbanBoard = () => {
  return (
    <KanbanBoardProvider>
      <KanbanBoardView />
    </KanbanBoardProvider>
  )
}
