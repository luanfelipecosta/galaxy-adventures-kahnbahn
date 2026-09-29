import { GraphQLClient, type RequestOptions, type Variables } from 'graphql-request'

export const RICK_AND_MORTY_GRAPHQL_ENDPOINT = 'https://rickandmortyapi.com/graphql'

export const graphQLClient = new GraphQLClient(RICK_AND_MORTY_GRAPHQL_ENDPOINT)

export const requestGraphQL = <TData, TVariables extends Variables = Variables>(
  options: RequestOptions<TVariables, TData>,
) => {
  return graphQLClient.request<TData, TVariables>(options)
}
