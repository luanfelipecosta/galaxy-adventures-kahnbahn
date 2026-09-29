import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import { server } from './msw-server'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter', () => ({
  draggable: vi.fn(() => () => undefined),
  dropTargetForElements: vi.fn(() => () => undefined),
}))

vi.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/attach-closest-edge', () => ({
  attachClosestEdge: vi.fn((data: Record<string, unknown>) => data),
}))

vi.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge', () => ({
  extractClosestEdge: vi.fn(() => 'bottom'),
}))

vi.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index', () => ({
  getReorderDestinationIndex: vi.fn(
    ({
      closestEdgeOfTarget,
      indexOfTarget,
      startIndex,
    }: {
      closestEdgeOfTarget: 'top' | 'bottom' | null
      indexOfTarget: number
      startIndex: number
    }) => {
      const destinationIndex = closestEdgeOfTarget === 'bottom' ? indexOfTarget + 1 : indexOfTarget

      return startIndex < destinationIndex ? destinationIndex - 1 : destinationIndex
    },
  ),
}))

vi.mock('@atlaskit/pragmatic-drag-and-drop/utils/combine', () => ({
  combine:
    (...cleanups: Array<() => void>) =>
    () => {
      cleanups.forEach((cleanupFn) => cleanupFn())
    },
}))

const originalFetch = globalThis.fetch

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  const mswFetch = globalThis.fetch.bind(globalThis)

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  })

  Object.defineProperty(window, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: vi.fn(function ResizeObserver() {
      return {
        disconnect: vi.fn(),
        observe: vi.fn(),
        unobserve: vi.fn(),
      }
    }),
  })

  globalThis.ResizeObserver = window.ResizeObserver

  globalThis.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/')) {
      return mswFetch(new URL(input, window.location.origin), init)
    }

    return mswFetch(input, init)
  }
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.clearAllMocks()
})

afterAll(() => {
  globalThis.fetch = originalFetch
  server.close()
})
