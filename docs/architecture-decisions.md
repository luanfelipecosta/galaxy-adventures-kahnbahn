# Architecture Decisions

This document records the main architectural choices behind Galaxy Adventures Kanban. It is intentionally practical: each decision explains what was chosen, why, and what tradeoff it accepts.

## ADR 001: Keep The App Frontend-Only

**Decision:** The application remains a Vite React frontend with no custom backend.

**Why:** The project is a focused product-interface prototype. A frontend-only setup keeps iteration fast and makes the board easy to run locally.

**Tradeoff:** Kanban persistence is mocked in development. Real persistence would require replacing the mock endpoints with a backend or hosted API.

## ADR 002: Use MSW For Kanban API Mocks

**Decision:** Kanban item endpoints are implemented with Mock Service Worker in development.

**Why:** MSW lets the UI exercise realistic HTTP behavior, latency, validation, errors, and optimistic rollback without introducing a backend.

**Tradeoff:** Mock data is in memory and resets on reload. This is acceptable for a prototype and local demo.

## ADR 003: Gate Mocks Outside Production

**Decision:** MSW starts only in development or when `VITE_ENABLE_MOCKS=true`.

**Why:** Production bundles should not pay for the mock worker or accidentally intercept real requests.

**Tradeoff:** Production preview without mocks requires either `VITE_ENABLE_MOCKS=true` or real API endpoints.

## ADR 004: Keep Server State In TanStack Query

**Decision:** Fetched Kanban items, character queries, mutations, invalidation, and optimistic updates use TanStack Query.

**Why:** Kanban items and character data behave like server state. TanStack Query gives caching, loading states, stale-time behavior, and mutation lifecycle hooks without custom infrastructure.

**Tradeoff:** Components rely on query providers at the app boundary, but this is already part of the app architecture.

## ADR 005: Keep Local Board UI State In A Feature Provider

**Decision:** Board UI state lives in `KanbanBoardProvider` with a reducer and split state/actions contexts.

**Why:** Create/edit dialog state, filters, search text, open menus, active drag item, and celebration keys are local to the Kanban feature. A feature provider removes deep action prop drilling while avoiding a global state library.

**Tradeoff:** Components must be rendered inside the provider. The custom hooks throw explicit errors if they are used outside that boundary.

## ADR 006: Keep Domain Rules In Model Utilities

**Decision:** Kanban statuses, priorities, movement rules, grouping, positions, labels, and assignee normalization live in `src/features/kanban/model`.

**Why:** Pure domain helpers are easier to test, reuse from mocks, and reason about than rules embedded in components.

**Tradeoff:** Components call into model helpers rather than defining rules inline, which adds a little import ceremony but keeps behavior consistent.

## ADR 007: Organize Kanban By Feature Layers

**Decision:** `src/features/kanban` is split into `api`, `components`, `hooks`, `model`, and `state`.

**Why:** The feature has grown beyond a few components. Layered folders make ownership clear:

- `api`: HTTP calls
- `components`: rendering and interaction UI
- `hooks`: query/mutation hooks
- `model`: types, constants, and pure helpers
- `state`: reducer, provider, and context hooks

**Tradeoff:** More folders mean slightly more navigation, but files are easier to locate by responsibility.

## ADR 008: Use Radix-Backed shadcn-Style Primitives

**Decision:** Dialog, Dropdown Menu, Popover, and Button are local UI primitives under `src/components/ui`.

**Why:** Radix primitives provide keyboard support, focus management, escape behavior, positioning, and accessibility semantics. Local wrappers keep styling consistent with the app's Tailwind tokens.

**Tradeoff:** The project depends on additional Radix packages, but avoids fragile custom outside-click and menu behavior.

## ADR 009: Use Pragmatic Drag And Drop For Board Interactions

**Decision:** Drag/drop behavior uses Atlassian Pragmatic Drag and Drop plus the hitbox utilities.

**Why:** Kanban drag behavior needs reliable element adapters, drop targets, closest-edge detection, and reorder indices. A purpose-built DnD library is safer than hand-rolled pointer logic.

**Tradeoff:** DnD setup code is somewhat verbose, so it is isolated in card and column components.

## ADR 010: Use Sparse Numeric Positions For Ordering

**Decision:** Items store numeric `position` values. Inserts calculate a position before, after, or between neighbors.

**Why:** Sparse positions make reordering cheap and avoid renumbering every item in a column on each move.

**Tradeoff:** Repeated insertions between the same two positions can eventually reduce spacing. For this prototype, that is fine; a backend could periodically rebalance positions if needed.

## ADR 011: Lazy-Load Rare Or Heavy Paths

**Decision:** The item form dialog is lazy-loaded. Markdown rendering is lazy-loaded behind the preview tab.

**Why:** Most first-load board usage is scanning, filtering, or dragging. Form libraries, validation, and markdown parsing do not need to sit on the initial board path.

**Tradeoff:** The first dialog open or preview switch may fetch a chunk, but it reduces initial bundle pressure.

## ADR 012: Respect Reduced Motion

**Decision:** Done celebrations check `prefers-reduced-motion` before running visual celebration effects.

**Why:** The app uses microanimations, but completion feedback should not ignore user motion preferences.

**Tradeoff:** Users with reduced motion still receive toast feedback but not the animated celebration.

## ADR 013: Prefer Explicit Item Data In Rendering

**Decision:** Cards and columns still receive item data as props while board actions come from context.

**Why:** Item props keep render dependencies obvious and make list rendering clear. Actions in context remove repetitive callback plumbing.

**Tradeoff:** This is a hybrid approach rather than putting all board data access in every component. The split is intentional: data stays explicit where it improves readability.

## ADR 014: Keep Public Feature Imports Stable

**Decision:** `@/features/kanban` remains the public feature entrypoint for the board and domain exports used outside the feature.

**Why:** Pages and mocks should not need to know the internal Kanban folder layout.

**Tradeoff:** The barrel exports a few domain helpers for mocks, but it prevents deep coupling to internal paths.

## ADR 015: Use Vitest And React Testing Library For Frontend Tests

**Decision:** Frontend tests use Vitest, React Testing Library, jest-dom matchers, `jsdom`, and MSW's node server.

**Why:** The app is a Vite React TypeScript frontend, so Vitest reuses the Vite pipeline and keeps configuration small. React Testing Library covers user-facing Kanban behavior at the component/integration level, while MSW keeps REST and GraphQL data deterministic without introducing a backend.

**Tradeoff:** Browser-only behavior such as physical drag gestures is not fully simulated in jsdom. Drag-and-drop adapters are mocked in tests, and movement confidence comes from pure Kanban utility tests plus status-change integration coverage.

## ADR 016: Prefer Integration Tests For Board Behavior

**Decision:** Kanban board behavior is tested primarily through integration tests that render the board with an isolated QueryClient and mocked network responses.

**Why:** The main risk is interaction among TanStack Query, GraphQL assignee loading, REST mutations, dialogs, filters, and board state. Testing through the rendered UI gives better confidence than isolated component tests for those paths.

**Tradeoff:** Integration tests need more setup fixtures and handlers than narrow unit tests. The shared helpers in `src/test` keep that setup reusable and deterministic.
