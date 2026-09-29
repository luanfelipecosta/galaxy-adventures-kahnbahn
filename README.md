# Galaxy Adventures Kanban

A frontend-only Kanban board for planning galaxy adventures with Rick and Morty character assignees. The app combines a polished board interaction model, searchable character data from GraphQL, mocked Kanban persistence, and responsive dashboard styling.

## What It Does

- Kanban board with `To do`, `Doing`, and `Done` columns.
- Create and edit adventure items with title, markdown description, priority, labels, assignee, and status.
- Drag and reorder cards with allowed status transitions.
- Searchable Rick and Morty character list for assignee selection.
- Priority and assignee filters with accessible dropdown/popover controls.
- Loading, empty, error, saving, and optimistic-update states.
- Microanimations for card reordering, drag/drop feedback, hover/focus states, dialog transitions, and done celebrations.
- Responsive layout with stable columns, horizontal scrolling, and mobile-friendly dialogs.
- Frontend mock API with MSW in development.

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- shadcn-style local UI primitives backed by Radix UI
- TanStack Query for server-state caching and mutations
- GraphQL Request + generated typed documents for Rick and Morty API queries
- Atlassian Pragmatic Drag and Drop for board interactions
- React Hook Form + Zod for item form validation
- MSW for local Kanban API mocks
- Vitest + React Testing Library + MSW for frontend tests

## Getting Started

```bash
pnpm install
pnpm dev
```

The Vite dev server starts the app locally. In development, MSW is enabled by default and serves the Kanban item endpoints from in-memory mock data.

## Useful Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm api:generate
pnpm test
pnpm test:run
pnpm test:coverage
```

- `pnpm dev` runs the Vite dev server.
- `pnpm build` type-checks with `tsc -b` and creates a production build.
- `pnpm preview` serves the production build locally.
- `pnpm api:generate` regenerates GraphQL typed documents from `codegen.ts`.
- `pnpm test` runs Vitest in watch mode.
- `pnpm test:run` runs the test suite once.
- `pnpm test:coverage` runs the test suite with V8 coverage.

## Environment And Mocks

MSW is gated in `src/main.tsx`:

- Enabled automatically when `import.meta.env.DEV` is true.
- Can be forced with `VITE_ENABLE_MOCKS=true`.
- Not loaded in ordinary production builds, which keeps MSW out of the production bundle.

Kanban mock endpoints live in `src/mocks/handlers.ts`:

- `GET /api/kanban/items`
- `POST /api/kanban/items`
- `PATCH /api/kanban/items/:itemId`

The character search path uses the Rick and Morty GraphQL API via typed GraphQL documents under `src/lib/graphql`.

## Project Structure

```text
src/
  app/                  App composition and providers
  components/
    shared/             Reusable non-feature components
    ui/                 Local shadcn-style primitives
  features/
    kanban/
      api/              Kanban HTTP client functions
      components/       Board, card, column, filter, and dialog UI
      hooks/            Feature hooks backed by TanStack Query
      model/            Domain types, constants, and pure utilities
      state/            Local board provider, reducer, contexts, and types
  lib/
    graphql/            GraphQL client and generated documents
    react-query/        Query client and shared query options
  mocks/                MSW browser worker and handlers
  pages/                Page-level composition
  test/                 Vitest setup, MSW server, fixtures, and render helpers
```

`@/features/kanban` remains the public feature entrypoint. Internal code is organized by layer, while mocks and pages import through the public barrel where possible.

## Feature Highlights

### Searchable Character List

Assignee controls query Rick and Morty characters with TanStack Query and typed GraphQL functions. The board merges currently assigned characters with searched results so existing cards keep their avatars and names even while a user searches for a different assignee.

### Loading And Empty States

The board uses column and card skeletons while Kanban items load. Assignee avatars show localized skeletons when card data is present before character data resolves. Empty board and empty filtered states use distinct copy and icons so the user knows whether to create an item or loosen filters.

### Drag, Reorder, And Transitions

Cards use Atlassian Pragmatic Drag and Drop. Status transitions are governed by the Kanban model, so items can move only through allowed paths:

- `To do` accepts from `Doing`
- `Doing` accepts from `To do` and `Done`
- `Done` accepts from `Doing`

Reordering uses sparse numeric positions, allowing cards to be inserted between neighbors without renumbering the whole column.

### Microanimations

The interface includes subtle transitions for hover, focus, drag-over, drop-edge indicators, dialog/menu presence, and FLIP-based list movement. Completing an item triggers toast feedback and a celebration effect unless the user has reduced motion enabled.

### Responsive Board

The page uses a dense dashboard layout. Columns stay stable on wider screens and scroll horizontally on narrow screens, while dialogs use constrained widths and viewport-safe max heights.

### Forms And Validation

Create/edit dialogs use React Hook Form and Zod. The form supports markdown descriptions with a lazy-loaded preview path, assignee search, priority selection, label normalization, and status choices limited by the transition model.

### Accessibility

Controls use Radix-backed Dialog, Dropdown Menu, and Popover primitives for keyboard behavior, focus management, escape handling, collision-aware positioning, and screen-reader semantics. Buttons and icon controls include accessible labels where needed.

### Performance

The item form dialog is lazy-loaded from the initial board path. Markdown rendering is also lazy-loaded and only fetched when the preview tab is opened. Production builds exclude MSW by default.

### Testing

Vitest runs in a `jsdom` environment with React Testing Library. The test setup in `src/test/setup.ts` installs jest-dom matchers, starts the MSW node server, polyfills browser APIs used by Radix/Floating UI, and mocks drag-and-drop adapters so jsdom tests focus on board behavior rather than browser pointer internals.

Current coverage includes:

- Pure Kanban model utilities for movement rules, grouping, sorting, and position calculation.
- Kanban API helpers for REST response parsing, request bodies, and surfaced API errors.
- Board integration flows for initial loading, filtering, create/edit dialogs, status moves, and initial fetch failures.

Drag-and-drop internals are intentionally not physically simulated in jsdom. Movement rules are covered through model utilities and status-change integration tests.

## Architecture Decisions

See [docs/architecture-decisions.md](docs/architecture-decisions.md) for the decision log.

Short version:

- Keep the app frontend-only.
- Keep server state in TanStack Query.
- Keep local board UI state in a feature-scoped reducer/context provider.
- Keep Kanban domain rules in pure model utilities.
- Use Radix/shadcn-style primitives instead of custom menu/dialog behavior.
- Lazy-load rare or heavy UI paths.
- Test frontend behavior with Vitest, React Testing Library, and MSW.
- Gate mocks outside production.

## Verification

Current verification used during the Kanban refactor and test setup:

```bash
pnpm test:run
pnpm build
```

The production build emits separate chunks for the item form dialog and markdown preview path.

## Related Docs

- [Frontend development conventions](docs/frontend-development.md)
- [Architecture decisions](docs/architecture-decisions.md)
- [Design QA notes](design-qa.md)
