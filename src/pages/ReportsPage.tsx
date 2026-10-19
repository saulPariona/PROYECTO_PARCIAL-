import { useMemo, useState } from 'react'
import { BookOpen, Download, FileSpreadsheet, FileText, FilterX, Users } from 'lucide-react'
import { PageTitle } from '../components/ui/PageTitle'
import { Pagination } from '../components/ui/Pagination'
import { usePagination } from '../lib/usePagination'
import { formatDate, isOverdue } from '../lib/dates'
import { downloadXlsx } from '../lib/excel'
import { normalizeText } from '../lib/validation'
import type { Book, Loan, User } from '../types/library'

type Kind = 'loans' | 'books' | 'users'
type Cell = string | number
type Column<T> = { header: string; get: (row: T) => Cell }

type Filters = { from: string; to: string; status: string; userType: string; category: string; availability: string; activity: string; query: string }
const emptyFilters: Filters = { from: '', to: '', status: '', userType: '', category: '', availability: '', activity: '', query: '' }

type LoanRow = { code: string; user: string; userCode: string; userType: string; book: string; category: string; borrowedAt: string; dueAt: string; returnedAt: string; status: string }
type BookRow = { title: string; author: string; isbn: string; category: string; stock: number; total: number; active: number; state: string }
type UserRow = { name: string; code: string; email: string; role: string; total: number; active: number; overdue: number }

const loanColumns: Column<LoanRow>[] = [
  { header: 'Código', get: (r) => r.code }, { header: 'Usuario', get: (r) => r.user }, { header: 'Cód. usuario', get: (r) => r.userCode },
  { header: 'Tipo', get: (r) => r.userType }, { header: 'Libro', get: (r) => r.book }, { header: 'Categoría', get: (r) => r.category },
  { header: 'Fecha préstamo', get: (r) => formatDate(r.borrowedAt) }, { header: 'Fecha límite', get: (r) => formatDate(r.dueAt) },
  { header: 'Fecha devolución', get: (r) => formatDate(r.returnedAt) }, { header: 'Estado', get: (r) => r.status },
]
const bookColumns: Column<BookRow>[] = [
  { header: 'Título', get: (r) => r.title }, { header: 'Autor', get: (r) => r.author }, { header: 'ISBN', get: (r) => r.isbn },
  { header: 'Categoría', get: (r) => r.category }, { header: 'Disponibles', get: (r) => r.stock }, { header: 'Total', get: (r) => r.total },
  { header: 'Prestados', get: (r) => r.active }, { header: 'Estado', get: (r) => r.state },
]
const userColumns: Column<UserRow>[] = [
  { header: 'Usuario', get: (r) => r.name }, { header: 'Código', get: (r) => r.code }, { header: 'Correo', get: (r) => r.email },
  { header: 'Tipo', get: (r) => r.role }, { header: 'Préstamos', get: (r) => r.total }, { header: 'Activos', get: (r) => r.active }, { header: 'Vencidos', get: (r) => r.overdue },
]

const titles: Record<Kind, string> = { loans: 'Reporte de préstamos', books: 'Reporte de inventario', users: 'Reporte de usuarios' }
const fileStamp = () => new Date().toISOString().slice(0, 10)

async function exportPdf<T>(title: string, columns: Column<T>[], rows: T[], filtersText: string) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(16)
  doc.text(`BiblioUni - ${title}`, 14, 16)
  doc.setFontSize(9)
  doc.setTextColor(110)
  doc.text(`Generado: ${formatDate(fileStamp())}  |  Registros: ${rows.length}${filtersText ? `  |  Filtros: ${filtersText}` : ''}`, 14, 22)
  autoTable(doc, {
    startY: 27,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(c.get(row)))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [102, 54, 190] },
    alternateRowStyles: { fillColor: [247, 244, 252] },
  })
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${fileStamp()}.pdf`)
}

export function ReportsPage({ books, users, loans, categories }: { books: Book[]; users: User[]; loans: Loan[]; categories: string[] }) {
  const [kind, setKind] = useState<Kind>('loans')
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const set = (key: keyof Filters, value: string) => setFilters((current) => ({ ...current, [key]: value }))

  const loanRows = useMemo<LoanRow[]>(() => loans.map((loan) => {
    const user = users.find((item) => item.id === loan.userId)
    const book = books.find((item) => item.id === loan.bookId)
    return {
      code: loan.id, user: user?.name ?? 'Usuario eliminado', userCode: user?.code ?? '—', userType: user?.role ?? '—',
      book: book?.title ?? 'Libro eliminado', category: book?.category ?? '—', borrowedAt: loan.borrowedAt, dueAt: loan.dueAt,
      returnedAt: loan.returnedAt ?? '', status: isOverdue(loan) ? 'Vencido' : loan.status,
    }
  }), [loans, users, books])

  const bookRows = useMemo<BookRow[]>(() => books.map((book) => ({
    title: book.title, author: book.author, isbn: book.isbn, category: book.category, stock: book.stock, total: book.total,
    active: loans.filter((loan) => loan.bookId === book.id && loan.status === 'Activo').length, state: book.stock > 0 ? 'Disponible' : 'Agotado',
  })), [books, loans])

  const userRows = useMemo<UserRow[]>(() => users.map((user) => {
    const own = loans.filter((loan) => loan.userId === user.id)
    return { name: user.name, code: user.code, email: user.email, role: user.role, total: own.length, active: own.filter((l) => l.status === 'Activo').length, overdue: own.filter(isOverdue).length }
  }), [users, loans])

  const q = normalizeText(filters.query)
  const match = (text: string) => !q || normalizeText(text).includes(q)

  const filteredLoans = loanRows.filter((r) => (!filters.from || r.borrowedAt >= filters.from) && (!filters.to || r.borrowedAt <= filters.to) && (!filters.status || r.status === filters.status) && (!filters.userType || r.userType === filters.userType) && (!filters.category || r.category === filters.category) && match(`${r.code} ${r.user} ${r.userCode} ${r.book}`))
  const filteredBooks = bookRows.filter((r) => (!filters.category || r.category === filters.category) && (!filters.availability || r.state === filters.availability) && match(`${r.title} ${r.author} ${r.isbn}`))
  const filteredUsers = userRows.filter((r) => (!filters.userType || r.role === filters.userType) && (!filters.activity || (filters.activity === 'active' ? r.active > 0 : filters.activity === 'overdue' ? r.overdue > 0 : r.active === 0)) && match(`${r.name} ${r.code} ${r.email}`))

  const count = (rows: string[]) => Object.entries(rows.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item]: (acc[item] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1])

  const view = kind === 'loans'
    ? { rows: filteredLoans, columns: loanColumns as Column<unknown>[], kpis: [['Préstamos', filteredLoans.length], ['Activos', filteredLoans.filter((r) => r.status === 'Activo').length], ['Devueltos', filteredLoans.filter((r) => r.status === 'Devuelto').length], ['Vencidos', filteredLoans.filter((r) => r.status === 'Vencido').length]] as [string, number][], chartTitle: 'Préstamos por categoría', chart: count(filteredLoans.map((r) => r.category)) }
    : kind === 'books'
      ? { rows: filteredBooks, columns: bookColumns as Column<unknown>[], kpis: [['Títulos', filteredBooks.length], ['Ejemplares disponibles', filteredBooks.reduce((s, r) => s + r.stock, 0)], ['Prestados actualmente', filteredBooks.reduce((s, r) => s + r.active, 0)], ['Títulos agotados', filteredBooks.filter((r) => r.state === 'Agotado').length]] as [string, number][], chartTitle: 'Títulos por categoría', chart: count(filteredBooks.map((r) => r.category)) }
      : { rows: filteredUsers, columns: userColumns as Column<unknown>[], kpis: [['Usuarios', filteredUsers.length], ['Estudiantes', filteredUsers.filter((r) => r.role === 'Estudiante').length], ['Docentes', filteredUsers.filter((r) => r.role === 'Docente').length], ['Con préstamos activos', filteredUsers.filter((r) => r.active > 0).length]] as [string, number][], chartTitle: 'Usuarios por tipo', chart: count(filteredUsers.map((r) => r.role)) }

  const pager = usePagination(view.rows as unknown[], 10)
  const maxBar = Math.max(1, ...view.chart.map(([, n]) => n))
  const activeFilters = Object.entries(filters).filter(([, value]) => value)
  const filtersText = activeFilters.map(([key, value]) => `${key}=${value}`).join(', ')
  const switchKind = (next: Kind) => { setKind(next); setFilters(emptyFilters); pager.setPage(1) }
  const change = (key: keyof Filters, value: string) => { set(key, value); pager.setPage(1) }

  const exportExcel = () => downloadXlsx(`${kind}-${fileStamp()}`, titles[kind], view.columns.map((c) => c.header), view.rows.map((row) => view.columns.map((c) => c.get(row))))

  return (
    <>
      <PageTitle title="Reportes" description="Analiza la actividad de la biblioteca, filtra la información y expórtala." action={
        <div className="title-actions">
          <button className="outline-button" disabled={!view.rows.length} onClick={exportExcel}><FileSpreadsheet size={17} /> Excel</button>
          <button className="primary-button" disabled={!view.rows.length} onClick={() => exportPdf(titles[kind], view.columns, view.rows, filtersText)}><Download size={17} /> PDF</button>
        </div>
      } />

      <div className="report-tabs">
        <button className={kind === 'loans' ? 'active' : ''} onClick={() => switchKind('loans')}><FileText size={16} /> Préstamos</button>
        <button className={kind === 'books' ? 'active' : ''} onClick={() => switchKind('books')}><BookOpen size={16} /> Inventario</button>
        <button className={kind === 'users' ? 'active' : ''} onClick={() => switchKind('users')}><Users size={16} /> Usuarios</button>
      </div>

      <section className="panel report-filters">
        <label>Buscar<input placeholder={kind === 'loans' ? 'Código, usuario o libro…' : kind === 'books' ? 'Título, autor o ISBN…' : 'Nombre, código o correo…'} value={filters.query} onChange={(e) => change('query', e.target.value)} /></label>
        {kind === 'loans' && <>
          <label>Desde<input type="date" value={filters.from} onChange={(e) => change('from', e.target.value)} /></label>
          <label>Hasta<input type="date" value={filters.to} onChange={(e) => change('to', e.target.value)} /></label>
          <label>Estado<select value={filters.status} onChange={(e) => change('status', e.target.value)}><option value="">Todos</option><option>Activo</option><option>Devuelto</option><option>Vencido</option></select></label>
        </>}
        {(kind === 'loans' || kind === 'users') && <label>Tipo de usuario<select value={filters.userType} onChange={(e) => change('userType', e.target.value)}><option value="">Todos</option><option>Estudiante</option><option>Docente</option></select></label>}
        {(kind === 'loans' || kind === 'books') && <label>Categoría<select value={filters.category} onChange={(e) => change('category', e.target.value)}><option value="">Todas</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>}
        {kind === 'books' && <label>Disponibilidad<select value={filters.availability} onChange={(e) => change('availability', e.target.value)}><option value="">Todas</option><option>Disponible</option><option>Agotado</option></select></label>}
        {kind === 'users' && <label>Actividad<select value={filters.activity} onChange={(e) => change('activity', e.target.value)}><option value="">Todos</option><option value="active">Con préstamos activos</option><option value="overdue">Con préstamos vencidos</option><option value="none">Sin préstamos activos</option></select></label>}
        <button className="outline-button" disabled={!activeFilters.length} onClick={() => { setFilters(emptyFilters); pager.setPage(1) }}><FilterX size={16} /> Limpiar</button>
      </section>

      <section className="stats-grid">
        {view.kpis.map(([label, value]) => <div className="stat-card kpi" key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </section>

      <div className="report-grid">
        <section className="panel table-panel">
          <div className="table-wrap">
            <table>
              <thead><tr>{view.columns.map((c) => <th key={c.header}>{c.header.toUpperCase()}</th>)}</tr></thead>
              <tbody>
                {pager.items.map((row, index) => <tr key={index}>{view.columns.map((c) => <td key={c.header}>{c.header === 'Estado' ? <span className={`status ${['Activo', 'Disponible'].includes(String(c.get(row))) ? 'active-status' : ['Vencido', 'Agotado'].includes(String(c.get(row))) ? 'danger-status' : 'returned-status'}`}>{c.get(row)}</span> : c.get(row)}</td>)}</tr>)}
                {view.rows.length === 0 && <tr><td colSpan={view.columns.length} className="empty-state">No hay datos con los filtros aplicados.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination pager={pager} />
        </section>
        <section className="panel">
          <div className="panel-heading"><div><h2>{view.chartTitle}</h2><p>Según los filtros aplicados</p></div></div>
          {view.chart.length === 0 && <p className="empty-state">Sin datos.</p>}
          {view.chart.slice(0, 8).map(([label, n]) => (
            <div className="bar-row" key={label}>
              <div className="bar-label"><span>{label}</span><strong>{n}</strong></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${(n / maxBar) * 100}%` }} /></div>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}
