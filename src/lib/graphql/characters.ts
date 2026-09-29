import { requestGraphQL } from './client'
import {
  CharactersByIdsDocument,
  CharactersDocument,
  type CharactersByIdsQuery,
  type CharactersByIdsQueryVariables,
  type CharactersQuery,
  type CharactersQueryVariables,
} from './generated'

export const getCharacters = (variables: CharactersQueryVariables) => {
  return requestGraphQL<CharactersQuery, CharactersQueryVariables>({
    document: CharactersDocument,
    variables,
  })
}

export const getCharactersByIds = (variables: CharactersByIdsQueryVariables) => {
  return requestGraphQL<CharactersByIdsQuery, CharactersByIdsQueryVariables>({
    document: CharactersByIdsDocument,
    variables,
  })
}
