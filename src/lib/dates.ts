import type { Loan } from '../types/library'

/** Fecha local en formato AAAA-MM-DD (evita el desfase por UTC de toISOString). */
export function toISODate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function addDays(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

export function formatDate(iso?: string) {
  return iso ? iso.split('-').reverse().join('/') : '—'
}

export function isOverdue(loan: Loan) {
  return loan.status === 'Activo' && loan.dueAt < toISODate()
}
