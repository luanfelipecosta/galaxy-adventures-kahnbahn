import { NavigationMenuBar } from '@/components/shared'
import { KanbanBoard } from '@/features/kanban'

export const KanbanPage = () => {
  return (
    <main className="min-h-screen bg-background py-4 text-foreground sm:py-6 lg:py-8">
      <section className="flex min-h-[calc(100vh-2rem)] w-full sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <NavigationMenuBar />

        <div className="flex min-w-0 flex-1 flex-col rounded-l-xl border-y border-l border-border bg-card p-5 text-card-foreground shadow-[var(--shadow-shell)] sm:p-8">
          <KanbanBoard />
        </div>
      </section>
    </main>
  )
}
