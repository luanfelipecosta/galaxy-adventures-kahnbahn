import type { ReactNode } from 'react'
import { useState } from 'react'
import { Toaster } from 'sonner'

import { createQueryClient, QueryProvider } from '@/lib/react-query'

type AppProvidersProps = {
  children: ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryProvider client={queryClient}>
      {children}
      <Toaster
        closeButton
        duration={4500}
        position="bottom-right"
        visibleToasts={3}
        toastOptions={{
          classNames: {
            toast:
              'rounded-md border border-border bg-card text-card-foreground shadow-[var(--shadow-card-soft)]',
            title: 'text-sm font-medium text-card-foreground',
            closeButton:
              'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground',
            success: 'border-success/40',
            error: 'border-destructive/40',
          },
        }}
      />
    </QueryProvider>
  )
}
