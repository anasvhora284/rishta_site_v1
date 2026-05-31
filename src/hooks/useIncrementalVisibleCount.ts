import { useCallback, useEffect, useState } from 'react'

export const LIST_INITIAL_COUNT = 40
export const LIST_LOAD_MORE_COUNT = 40

/**
 * Renders only the first N items, growing on demand (scroll sentinel / jump-to-ID).
 */
export function useIncrementalVisibleCount(
  totalCount: number,
  options?: { initial?: number; step?: number },
) {
  const initial = options?.initial ?? LIST_INITIAL_COUNT
  const step = options?.step ?? LIST_LOAD_MORE_COUNT

  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(initial, totalCount),
  )

  useEffect(() => {
    setVisibleCount(Math.min(initial, totalCount))
  }, [totalCount, initial])

  const loadMore = useCallback(() => {
    setVisibleCount((current) => {
      if (current >= totalCount) return current
      return Math.min(current + step, totalCount)
    })
  }, [totalCount, step])

  const ensureIndexVisible = useCallback(
    (index: number) => {
      if (index < 0) return
      const needed = index + 1
      setVisibleCount((current) => Math.min(Math.max(current, needed), totalCount))
    },
    [totalCount],
  )

  const hasMore = visibleCount < totalCount

  return { visibleCount, loadMore, ensureIndexVisible, hasMore }
}
