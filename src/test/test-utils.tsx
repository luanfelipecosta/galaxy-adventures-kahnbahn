import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  })
}

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
  queryClient?: QueryClient
}

export const renderWithProviders = (
  ui: ReactElement,
  { queryClient = createTestQueryClient(), ...renderOptions }: RenderWithProvidersOptions = {},
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}
