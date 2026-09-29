import type { ReactNode } from 'react'
import { useState } from 'react'

import { createQueryClient, QueryProvider } from '@/lib/react-query'

type AppProvidersProps = {
  children: ReactNode
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  const [queryClient] = useState(createQueryClient)

  return <QueryProvider client={queryClient}>{children}</QueryProvider>
}
