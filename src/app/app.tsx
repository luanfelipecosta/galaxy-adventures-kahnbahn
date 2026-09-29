import { KanbanPage } from '@/pages/kanban-page'

import { AppProviders } from './providers'

export const App = () => {
  return (
    <AppProviders>
      <KanbanPage />
    </AppProviders>
  )
}
