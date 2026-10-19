import { useState } from 'react'

export function usePagination<T>(items: T[], initialSize = 10) {
  const [page, setPage] = useState(1)
  const [size, setSizeState] = useState(initialSize)
  const pages = Math.max(1, Math.ceil(items.length / size))
  const current = Math.min(page, pages)
  return {
    items: items.slice((current - 1) * size, current * size),
    page: current,
    pages,
    size,
    total: items.length,
    setPage,
    setSize: (next: number) => { setSizeState(next); setPage(1) },
  }
}

export type Pager = ReturnType<typeof usePagination>

