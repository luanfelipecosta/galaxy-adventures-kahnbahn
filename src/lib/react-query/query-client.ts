import { QueryClient } from '@tanstack/react-query'

const ONE_MINUTE_IN_MS = 60 * 1000

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: ONE_MINUTE_IN_MS,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}
