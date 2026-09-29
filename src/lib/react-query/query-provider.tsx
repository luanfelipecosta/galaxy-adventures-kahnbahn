import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'

type QueryProviderProps = {
  children: ReactNode
  client: QueryClient
}

export const QueryProvider = ({ children, client }: QueryProviderProps) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
