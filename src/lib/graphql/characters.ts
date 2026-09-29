import charactersQuery from './queries/characters.query?raw'
import { requestGraphQL } from './client'

export type CharacterStatus = 'Alive' | 'Dead' | 'unknown'

export type CharacterListItem = {
  id: string
  name: string
  image: string
  species: string
  status: CharacterStatus
}

export type CharactersQueryVariables = {
  page?: number
  name?: string
}

export type CharactersQueryResult = {
  characters: {
    info: {
      count: number
      pages: number
      next: number | null
      prev: number | null
    }
    results: CharacterListItem[]
  }
}

export const getCharacters = (variables: CharactersQueryVariables = {}) => {
  return requestGraphQL<CharactersQueryResult, CharactersQueryVariables>({
    document: charactersQuery,
    variables,
  })
}
