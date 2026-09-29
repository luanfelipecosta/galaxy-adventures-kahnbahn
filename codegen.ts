import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'https://rickandmortyapi.com/graphql',
  documents: 'src/lib/graphql/**/*.graphql',
  generates: {
    'src/lib/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        avoidOptionals: false,
        enumsAsTypes: true,
        maybeValue: 'T | null',
      },
    },
  },
}

export default config
