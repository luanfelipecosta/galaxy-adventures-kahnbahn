import type { DependencyList, RefObject } from 'react'
import { useLayoutEffect, useRef } from 'react'

type UseFlipListOptions = {
  dependencies: DependencyList
  listRef: RefObject<HTMLElement | null>
}

const getShouldReduceMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const useFlipList = ({ dependencies, listRef }: UseFlipListOptions) => {
  const previousRectsRef = useRef<Map<string, DOMRect>>(new Map())

  useLayoutEffect(() => {
    const listElement = listRef.current

    if (!listElement) {
      return
    }

    const items = Array.from(listElement.querySelectorAll<HTMLElement>('[data-flip-id]'))
    const shouldReduceMotion = getShouldReduceMotion()

    if (!shouldReduceMotion) {
      items.forEach((item) => {
        const id = item.dataset.flipId
        const previousRect = id ? previousRectsRef.current.get(id) : null

        if (!id || !previousRect) {
          return
        }

        const nextRect = item.getBoundingClientRect()
        const deltaX = previousRect.left - nextRect.left
        const deltaY = previousRect.top - nextRect.top

        if (deltaX === 0 && deltaY === 0) {
          return
        }

        item.animate(
          [
            { transform: `translate(${deltaX}px, ${deltaY}px)` },
            { transform: 'translate(0, 0)' },
          ],
          {
            duration: 240,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          },
        )
      })
    }

    previousRectsRef.current = new Map(
      items
        .map((item) => {
          const id = item.dataset.flipId

          return id ? ([id, item.getBoundingClientRect()] as const) : null
        })
        .filter((entry): entry is readonly [string, DOMRect] => Boolean(entry)),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
}
