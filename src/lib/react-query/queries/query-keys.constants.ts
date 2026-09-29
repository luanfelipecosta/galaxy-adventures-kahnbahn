import type { CharactersByIdsQueryVariables, CharactersQueryVariables } from '@/lib/graphql'

export const DEFAULT_CHARACTERS_QUERY_VARIABLES = {
  page: 1,
} satisfies CharactersQueryVariables

export const characterQueryKeys = {
  all: ['characters'] as const,
  lists: () => [...characterQueryKeys.all, 'list'] as const,
  list: (variables: CharactersQueryVariables = DEFAULT_CHARACTERS_QUERY_VARIABLES) => {
    return [...characterQueryKeys.lists(), variables] as const
  },
  byIds: (variables: CharactersByIdsQueryVariables) => {
    return [...characterQueryKeys.all, 'by-ids', variables] as const
  },
}
