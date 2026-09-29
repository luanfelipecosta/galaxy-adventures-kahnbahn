import { queryOptions, useQuery } from '@tanstack/react-query'

import { getCharacters, getCharactersByIds, type CharactersByIdsQueryVariables, type CharactersQueryVariables } from '@/lib/graphql'

import { characterQueryKeys, DEFAULT_CHARACTERS_QUERY_VARIABLES } from './query-keys.constants'

export const charactersQueryOptions = (
  variables: CharactersQueryVariables = DEFAULT_CHARACTERS_QUERY_VARIABLES,
  enabled = true,
) => {
  return queryOptions({
    queryKey: characterQueryKeys.list(variables),
    queryFn: () => getCharacters(variables),
    enabled,
  })
}

export const useCharactersQuery = (variables?: CharactersQueryVariables, enabled = true) => {
  return useQuery(charactersQueryOptions(variables, enabled))
}

export const charactersByIdsQueryOptions = (variables: CharactersByIdsQueryVariables) => {
  return queryOptions({
    queryKey: characterQueryKeys.byIds(variables),
    queryFn: () => getCharactersByIds(variables),
    enabled: Array.isArray(variables.ids) ? variables.ids.length > 0 : Boolean(variables.ids),
  })
}

export const useCharactersByIdsQuery = (variables: CharactersByIdsQueryVariables) => {
  return useQuery(charactersByIdsQueryOptions(variables))
}
