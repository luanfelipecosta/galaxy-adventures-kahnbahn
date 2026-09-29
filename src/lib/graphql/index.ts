export {
  graphQLClient,
  requestGraphQL,
  RICK_AND_MORTY_GRAPHQL_ENDPOINT,
} from './client'
export { getCharacters, getCharactersByIds } from './characters'
export type { CharactersByIdsQuery, CharactersByIdsQueryVariables, CharactersQuery, CharactersQueryVariables } from './generated'
