# Frontend Development Conventions

Use this guide for all React, TypeScript, Tailwind CSS, and shadcn/ui work in
this repository.

## Code Style

- Write React components as arrow functions.
- Write helpers, hooks, callbacks, and exported utilities as arrow functions.
- Prefer named exports over default exports.
- Prefer `type` aliases for object shapes and component props.
- Keep props explicit and narrow. Avoid `any`.
- Keep components small and composition-first.
- Place shared behavior in hooks or utilities only when it is reused or clearly
  separates domain logic from rendering.

```tsx
type ExampleCardProps = {
  title: string
  description?: string
}

export const ExampleCard = ({ title, description }: ExampleCardProps) => {
  return (
    <section className="rounded-lg border bg-card p-4 text-card-foreground">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </section>
  )
}
```

## Component Folders

Create application components in a single folder named with `kebab-case`.

```text
src/
  components/
    ui/
      button.tsx
      input.tsx
    user-profile-card/
      user-profile-card.tsx
      user-profile-card.types.ts
      user-profile-card.utils.ts
      user-profile-card.constants.ts
      index.ts
```

Use this naming pattern:

- Folder: `user-profile-card`
- Main component file: `user-profile-card.tsx`
- Types: `user-profile-card.types.ts`
- Utilities: `user-profile-card.utils.ts`
- Constants: `user-profile-card.constants.ts`
- Barrel export: `index.ts`
- Component symbol: `UserProfileCard`

Only create files that are needed. A simple component can start with just:

```text
user-profile-card/
  user-profile-card.tsx
  index.ts
```

## File Responsibilities

- `*.tsx`: React rendering and component-local composition.
- `*.types.ts`: exported types and interfaces used by the component folder.
- `*.utils.ts`: pure helper functions with no React rendering.
- `*.constants.ts`: stable values, option lists, labels, and config objects.
- `index.ts`: public exports for the folder.

Keep component folder internals private unless another part of the app needs
them. Export through `index.ts`.

```ts
export { UserProfileCard } from './user-profile-card'
export type { UserProfileCardProps } from './user-profile-card.types'
```

## shadcn/ui

- Keep shadcn/ui primitives in `src/components/ui`.
- Treat shadcn/ui files as local source, but avoid changing generated primitives
  unless the change belongs in the app design system.
- Compose app-specific components outside `components/ui`.
- Prefer shadcn/ui semantic tokens and variants over raw color utilities.
- Use accessible labels, `aria-*` attributes, and `data-*` states consistently.
- For buttons with icons, use the component API and icon patterns consistently.

## Tailwind CSS

- Prefer Tailwind utilities in `className`.
- Use `cn(...)` for conditional class composition once `src/lib/utils.ts`
  exists.
- Prefer `gap-*` for spacing between flex or grid children.
- Prefer `size-*` when width and height are equal.
- Prefer semantic theme tokens such as `bg-background`, `text-foreground`,
  `bg-card`, `text-muted-foreground`, `border-border`, and component variants.
- Avoid one-off custom CSS unless Tailwind utilities make the result unclear or
  brittle.

## Responsive Layout

- Start with mobile-first defaults, then use Tailwind breakpoint overrides for
  wider screens.
- Keep board columns on stable layout primitives such as fixed-width tracks,
  `minmax(...)`, or horizontal scroll containers so cards and drop zones do not
  resize unpredictably during drag-and-drop.
- Do not scale font size with viewport width. Use explicit text utilities at
  each breakpoint when headings or compact controls need to change.
- Give modals a narrow-screen width such as `w-[calc(100%-2rem)]` plus a
  reasonable `max-w-*`, and keep headers, bodies, and footers from overflowing on
  mobile.
- Prefer responsive spacing and wrapping over hidden content when actions need to
  fit small screens.

## App Structure

- Keep app-level composition in `src/app`, including providers.
- Keep the single page entry in `src/pages/kanban-page` until routing is needed.
- Keep shadcn/ui primitives in `src/components/ui`.
- Keep reusable non-feature components in `src/components/shared`.
- Keep Kanban board, card, column, form, and drag-and-drop behavior in
  `src/features/kanban`.
- Use shadcn/ui `Dialog` for create and detail modals. Always provide an
  accessible title, description when useful, and at least one focusable control.

## Imports

- Prefer local relative imports inside a component folder.
- Prefer the `@/` alias for shared app imports once it is configured.
- Keep import order readable: external packages, shared app modules, local files,
  styles.

```tsx
import { Button } from '@/components/ui/button'

import type { UserProfileCardProps } from './user-profile-card.types'
import { getInitials } from './user-profile-card.utils'
```

## State And Effects

- Keep state as close as possible to where it is used.
- Derive values during render when possible instead of storing duplicate state.
- Use effects for synchronization with external systems, not for routine data
  derivation.
- Extract reusable stateful behavior into `use-*` hooks using arrow functions.

```ts
export const useSelectedId = (initialId: string | null = null) => {
  const [selectedId, setSelectedId] = useState<string | null>(initialId)

  return { selectedId, setSelectedId }
}
```

## Review Checklist

- Components use arrow functions and named exports.
- New component folders use `kebab-case`.
- Types, utilities, constants, and rendering are separated when useful.
- shadcn/ui primitives remain in `src/components/ui`.
- Tailwind classes use semantic tokens and stable layout utilities.
- No unnecessary custom CSS, broad abstractions, or untyped data paths were added.
