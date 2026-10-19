import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Pager } from '../../lib/usePagination'

function pageNumbers(page: number, pages: number): (number | '…')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1)
  const set = new Set([1, pages, page - 1, page, page + 1])
  const sorted = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b)
  const result: (number | '…')[] = []
  sorted.forEach((n, index) => {
    if (index > 0 && n - sorted[index - 1] > 1) result.push('…')
    result.push(n)
  })
  return result
}

export function Pagination({ pager, sizes = [5, 10, 20, 50] }: { pager: Pick<Pager, 'page' | 'pages' | 'size' | 'total' | 'setPage' | 'setSize'>; sizes?: number[] }) {
  if (pager.total === 0) return null
  const from = (pager.page - 1) * pager.size + 1
  const to = Math.min(pager.page * pager.size, pager.total)
  return (
    <div className="pagination">
      <span className="pagination-info">Mostrando {from}–{to} de {pager.total}</span>
      <div className="pagination-controls">
        <label className="pagination-size">Por página
          <select value={pager.size} onChange={(event) => pager.setSize(Number(event.target.value))}>{sizes.map((size) => <option key={size}>{size}</option>)}</select>
        </label>
        <button className="page-btn" disabled={pager.page === 1} onClick={() => pager.setPage(pager.page - 1)} aria-label="Página anterior"><ChevronLeft size={15} /></button>
        {pageNumbers(pager.page, pager.pages).map((n, index) => n === '…'
          ? <span className="page-gap" key={`gap-${index}`}>…</span>
          : <button key={n} className={`page-btn ${n === pager.page ? 'current' : ''}`} onClick={() => pager.setPage(n)}>{n}</button>)}
        <button className="page-btn" disabled={pager.page === pager.pages} onClick={() => pager.setPage(pager.page + 1)} aria-label="Página siguiente"><ChevronRight size={15} /></button>
      </div>
    </div>
  )
}
