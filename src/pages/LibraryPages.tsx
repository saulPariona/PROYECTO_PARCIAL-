import { BarChart3, BookOpen, Check, Edit3, FileSpreadsheet, FileText, Plus, Search, Trash2, UserPlus, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { Book, BorrowResult, Loan, User } from '../types/library'
import { formatDate, isOverdue } from '../lib/dates'
import { normalizeText, parseRole, validateBook, validateUser } from '../lib/validation'
import type { BookFields, UserDraft, UserFields } from '../lib/validation'
import { IconButton } from '../components/ui/IconButton'
import { ImportModal } from '../components/ui/ImportModal'
import { ConfirmModal, Modal } from '../components/ui/Modal'
import { PageTitle } from '../components/ui/PageTitle'
import { Pagination } from '../components/ui/Pagination'
import { usePagination } from '../lib/usePagination'

export type BookDraft = Omit<Book, 'id' | 'total'>

const statusClass = (loan: Loan) => `status ${loan.status === 'Activo' ? 'active-status' : 'returned-status'}`

export function Dashboard({ books, users, loans }: { books: Book[]; users: User[]; loans: Loan[] }) {
  const returned = loans.filter((loan) => loan.status === 'Devuelto').length
  const returnRate = loans.length ? `${Math.round((returned / loans.length) * 1000) / 10}%` : '—'
  return (
    <>
      <PageTitle title="Resumen general" description="Gestiona los recursos y préstamos de tu biblioteca." action={<Link className="primary-button" to="/libros"><Plus size={17} /> Añadir libro</Link>} />
      <section className="stats-grid">
        <Stat icon={<BookOpen />} label="Libros registrados" value={books.length} />
        <Stat icon={<FileText />} label="Préstamos activos" value={loans.filter((loan) => loan.status === 'Activo').length} />
        <Stat icon={<Users />} label="Usuarios registrados" value={users.length} />
        <Stat icon={<BarChart3 />} label="Tasa de devolución" value={returnRate} />
      </section>
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-heading"><div><h2>Actividad de préstamos</h2><p>Préstamos registrados en los últimos 6 meses</p></div></div>
          <div className="chart">
            <div className="chart-y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
            <div className="chart-area">
              <div className="grid-lines">{[1, 2, 3, 4].map((line) => <i key={line} />)}</div>
              <svg viewBox="0 0 600 190" preserveAspectRatio="none">
                <path d="M0,135 C40,116 63,142 100,105 S160,115 200,85 S260,102 300,70 S350,88 400,55 S445,72 500,38 S560,50 600,25 V190 H0Z" fill="url(#area)" />
                <path d="M0,135 C40,116 63,142 100,105 S160,115 200,85 S260,102 300,70 S350,88 400,55 S445,72 500,38 S560,50 600,25" fill="none" stroke="#6b35c8" strokeWidth="3" />
              </svg>
              <div className="chart-x"><span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span></div>
            </div>
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading"><div><h2>Préstamos recientes</h2><p>Últimos movimientos</p></div><Link className="text-link" to="/prestamos">Ver todos</Link></div>
          {loans.slice(0, 4).map((loan) => (
            <div className="recent-item" key={loan.id}>
              <div className="book-cover"><BookOpen size={16} /></div>
              <div className="recent-info"><strong>{books.find((book) => book.id === loan.bookId)?.title}</strong><span>{users.find((user) => user.id === loan.userId)?.name}</span></div>
              <span className={statusClass(loan)}>{loan.status}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return <div className="stat-card"><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong></div>
}

type CatalogProps = {
  books: Book[]
  categories: string[]
  users: User[]
  /** Usuario con sesión iniciada; si es undefined, quien navega es el administrador. */
  currentUser?: User
  borrow: (bookId: string, userId: string) => BorrowResult
}

export function Catalog({ books, categories, users, currentUser, borrow }: CatalogProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [selected, setSelected] = useState<Book | null>(null)
  const filtered = books.filter((book) => (!category || book.category === category) && normalizeText(`${book.title} ${book.category}`).includes(normalizeText(query)))
  const pager = usePagination(filtered, 8)

  return (
    <>
      <PageTitle title="Catálogo de libros" description="Encuentra el material que necesitas para tus estudios." />
      <div className="toolbar">
        <label className="search-box"><Search size={18} /><input placeholder="Buscar por título o categoría..." value={query} onChange={(event) => { setQuery(event.target.value); pager.setPage(1) }} /></label>
        <select className="filter-select" value={category} onChange={(event) => { setCategory(event.target.value); pager.setPage(1) }} aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      {filtered.length === 0 && <p className="empty-state">No se encontraron libros.</p>}
      <div className="catalog-grid">
        {pager.items.map((book) => (
          <article className="book-card" key={book.id}>
            <div className="book-art"><BookOpen size={34} /><span>{book.category}</span></div>
            <div className="book-card-body">
              <span className="tag">{book.category}</span>
              <h2>{book.title}</h2>
              <p>{book.author}</p>
              <div className="book-meta">
                <span><strong className={book.stock ? 'available' : 'unavailable'}>{book.stock}</strong> disponibles</span>
                <button className="outline-button" disabled={!book.stock} onClick={() => setSelected(book)}>{book.stock ? 'Solicitar' : 'Agotado'}</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <Pagination pager={pager} sizes={[8, 16, 32]} />
      {selected && (
        <LoanModal
          book={selected}
          users={users}
          currentUser={currentUser}
          close={() => setSelected(null)}
          confirm={(userId) => {
            const result = borrow(selected.id, userId)
            setSelected(null)
            if (result.id) navigate(`/comprobante/${result.id}`)
          }}
        />
      )}
    </>
  )
}

function LoanModal({ book, users, currentUser, close, confirm }: { book: Book; users: User[]; currentUser?: User; close: () => void; confirm: (userId: string) => void }) {
  const [userId, setUserId] = useState(currentUser?.id ?? users[0]?.id ?? '')
  return (
    <Modal title="Confirmar solicitud de préstamo" close={close}>
      <div className="confirmation-copy">
        <BookOpen size={28} />
        <p>{currentUser ? <>¿Solicitar el préstamo de <strong>{book.title}</strong>? Plazo: {currentUser.role === 'Docente' ? '14' : '7'} días.</> : <>Selecciona el usuario registrado que solicitará <strong>{book.title}</strong>.</>}</p>
      </div>
      {!currentUser && (
        <label className="standalone-label">Usuario registrado
          <select value={userId} onChange={(event) => setUserId(event.target.value)}>{users.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.code}</option>)}</select>
        </label>
      )}
      <div className="modal-actions">
        <button className="outline-button" onClick={close}>Cancelar</button>
        <button className="primary-button" disabled={!userId} onClick={() => confirm(userId)}><Check size={16} /> Confirmar préstamo</button>
      </div>
    </Modal>
  )
}

/** Vista del administrador: todos los préstamos y registro de devoluciones. */
export function Loans({ books, users, loans, returnLoan }: { books: Book[]; users: User[]; loans: Loan[]; returnLoan: (id: string) => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [returning, setReturning] = useState<Loan | undefined>()
  const visible = loans.filter((loan) => `${loan.id} ${books.find((book) => book.id === loan.bookId)?.title} ${users.find((user) => user.id === loan.userId)?.name}`.toLowerCase().includes(query.toLowerCase()))
  const pager = usePagination(visible, 10)
  return (
    <>
      <PageTitle title="Gestión de préstamos" description="Administra y consulta todos los préstamos." action={<Link to="/catalogo" className="primary-button"><Plus size={17} /> Nuevo préstamo</Link>} />
      <div className="panel table-panel">
        <div className="table-toolbar"><label className="search-box compact"><Search size={17} /><input placeholder="Buscar préstamo..." value={query} onChange={(event) => { setQuery(event.target.value); pager.setPage(1) }} /></label></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>CÓDIGO</th><th>USUARIO</th><th>LIBRO</th><th>FECHA</th><th>LÍMITE</th><th>DEVUELTO</th><th>ESTADO</th><th>ACCIONES</th></tr></thead>
            <tbody>
              {pager.items.map((loan) => (
                <tr key={loan.id}>
                  <td><strong>{loan.id}</strong></td>
                  <td>{users.find((user) => user.id === loan.userId)?.name ?? 'Usuario no encontrado'}</td>
                  <td>{books.find((book) => book.id === loan.bookId)?.title ?? 'Libro eliminado'}</td>
                  <td>{formatDate(loan.borrowedAt)}</td>
                  <td className={isOverdue(loan) ? 'overdue' : ''}>{formatDate(loan.dueAt)}</td>
                  <td>{formatDate(loan.returnedAt)}</td>
                  <td><span className={statusClass(loan)}>{loan.status}</span></td>
                  <td className="actions">
                    <div className="action-group">
                      <IconButton label="Ver comprobante" onClick={() => navigate(`/comprobante/${loan.id}`)}><FileText size={17} /></IconButton>
                      {loan.status === 'Activo' && <IconButton label="Registrar devolución" onClick={() => setReturning(loan)}><Check size={17} /></IconButton>}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && <tr><td colSpan={8} className="empty-state">No hay préstamos.</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination pager={pager} />
      </div>
      {returning && (
        <ConfirmModal
          title="Confirmar devolución"
          message={
            <>
              ¿Confirmas la devolución del libro <strong>"{books.find((b) => b.id === returning.bookId)?.title}"</strong> prestado a <strong>{users.find((u) => u.id === returning.userId)?.name}</strong>? El ejemplar se repondrá al inventario.
            </>
          }
          confirmText="Confirmar devolución"
          variant="primary"
          close={() => setReturning(undefined)}
          confirm={() => {
            returnLoan(returning.id)
            setReturning(undefined)
          }}
        />
      )}
    </>
  )
}

function MyLoansTable({ books, loans, empty }: { books: Book[]; loans: Loan[]; empty: string }) {
  const navigate = useNavigate()
  const pager = usePagination(loans, 5)
  return (
    <div className="panel table-panel">
      <div className="table-wrap">
        <table>
          <thead><tr><th>CÓDIGO</th><th>LIBRO</th><th>FECHA PRÉSTAMO</th><th>FECHA LÍMITE</th><th>FECHA DEVOLUCIÓN</th><th>ESTADO</th><th>COMPROBANTE</th></tr></thead>
          <tbody>
            {pager.items.map((loan) => (
              <tr key={loan.id}>
                <td><strong>{loan.id}</strong></td>
                <td>{books.find((book) => book.id === loan.bookId)?.title ?? 'Libro eliminado'}</td>
                <td>{formatDate(loan.borrowedAt)}</td>
                <td className={isOverdue(loan) ? 'overdue' : ''}>{formatDate(loan.dueAt)}{isOverdue(loan) && ' (vencido)'}</td>
                <td>{formatDate(loan.returnedAt)}</td>
                <td><span className={statusClass(loan)}>{loan.status}</span></td>
                <td className="actions"><IconButton label="Ver comprobante" onClick={() => navigate(`/comprobante/${loan.id}`)}><FileText size={17} /></IconButton></td>
              </tr>
            ))}
            {loans.length === 0 && <tr><td colSpan={7} className="empty-state">{empty}</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination pager={pager} sizes={[5, 10, 20]} />
    </div>
  )
}

/** Vista del usuario: préstamos activos e historial con fechas y estado. */
export function MyLoans({ books, loans }: { books: Book[]; loans: Loan[] }) {
  const active = loans.filter((loan) => loan.status === 'Activo')
  return (
    <>
      <PageTitle title="Mis préstamos" description="Libros prestados actualmente e historial completo." action={<Link to="/catalogo" className="primary-button"><Plus size={17} /> Solicitar libro</Link>} />
      <h2 className="section-title">Préstamos activos ({active.length})</h2>
      <MyLoansTable books={books} loans={active} empty="No tienes préstamos activos." />
      <h2 className="section-title">Historial de préstamos</h2>
      <MyLoansTable books={books} loans={loans} empty="Aún no has realizado préstamos." />
    </>
  )
}

export function Guide({ isAdmin }: { isAdmin: boolean }) {
  const adminSteps = [['01', 'Comienza desde el Resumen', 'Consulta métricas y movimientos recientes.', '/'], ['02', 'Administra el catálogo', 'Registra, edita y elimina libros y categorías.', '/libros'], ['03', 'Registra usuarios', 'El código universitario debe ser único. Estudiantes: 10 dígitos y una letra (2022100543M).', '/usuarios'], ['04', 'Gestiona préstamos', 'Registra préstamos y devoluciones.', '/prestamos'], ['05', 'Importa desde Excel', 'Carga libros y usuarios con la plantilla .xlsx.', '/libros'], ['06', 'Genera reportes', 'Filtra y exporta préstamos, libros y usuarios a Excel o PDF.', '/reportes']]
  const userSteps = [['01', 'Busca libros', 'Filtra por título o categoría y revisa la disponibilidad.', '/catalogo'], ['02', 'Solicita un préstamo', 'No es posible si el stock es cero.', '/catalogo'], ['03', 'Descarga tu comprobante', 'Se genera al registrar el préstamo.', '/mis-prestamos'], ['04', 'Consulta tu historial', 'Revisa préstamos activos, fechas y estado.', '/mis-prestamos']]
  const steps = isAdmin ? adminSteps : userSteps
  return (
    <>
      <PageTitle title="Guía de uso" description="Aprende a moverte por BiblioUni." />
      <div className="guide-grid">
        {steps.map(([number, title, text, to]) => (
          <section className="panel guide-intro" key={number}>
            <div className="guide-number">{number}</div>
            <div><h2>{title}</h2><p>{text}</p><Link className="text-link" to={to}>Ir al apartado</Link></div>
          </section>
        ))}
      </div>
    </>
  )
}

type BooksProps = {
  books: Book[]
  categories: string[]
  save: (book: Book | BookDraft) => string | undefined
  remove: (id: string) => void
  importBooks: (items: BookDraft[]) => void
}

export function Books({ books, categories, save, remove, importBooks }: BooksProps) {
  const [editing, setEditing] = useState<Book | undefined>()
  const [deleting, setDeleting] = useState<Book | undefined>()
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const pager = usePagination(books, 10)
  const close = () => { setOpen(false); setEditing(undefined) }

  const parseRow = (cells: string[], accepted: BookDraft[]) => {
    const [title, author, isbn, category, stock] = cells
    const errors = Object.values(validateBook({ title, author, isbn, category, stock }))
    if (errors.length) return { error: errors.join(' ') }
    if (books.some((book) => book.isbn === isbn.trim()) || accepted.some((book) => book.isbn === isbn.trim())) return { error: 'El ISBN ya existe o está repetido en el archivo.' }
    const known = categories.find((item) => normalizeText(item) === normalizeText(category))
    return { value: { title: title.trim(), author: author.trim(), isbn: isbn.trim(), category: known ?? category.trim(), stock: Number(stock) } }
  }

  return (
    <>
      <PageTitle title="Libros" description="Administra el inventario." action={
        <div className="title-actions">
          <button className="outline-button" onClick={() => setImporting(true)}><FileSpreadsheet size={17} /> Importar Excel</button>
          <button className="primary-button" onClick={() => setOpen(true)}><Plus size={17} /> Registrar libro</button>
        </div>
      } />
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>LIBRO</th><th>AUTOR</th><th>ISBN</th><th>CATEGORÍA</th><th>STOCK</th><th>ACCIONES</th></tr></thead>
            <tbody>
              {pager.items.map((book) => (
                <tr key={book.id}>
                  <td><strong>{book.title}</strong></td><td>{book.author}</td><td>{book.isbn}</td><td><span className="tag">{book.category}</span></td><td>{book.stock} / {book.total}</td>
                  <td className="actions">
                    <div className="action-group">
                      <IconButton label="Editar libro" onClick={() => setEditing(book)}><Edit3 size={17} /></IconButton>
                      <IconButton label="Eliminar libro" onClick={() => setDeleting(book)}><Trash2 size={17} /></IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {books.length === 0 && <tr><td colSpan={6} className="empty-state">No hay libros registrados.</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination pager={pager} />
      </div>
      {(open || editing) && <BookModal book={editing} categories={categories} close={close} save={(book) => { const error = save(editing ? { ...book, id: editing.id, total: Math.max(editing.total, book.stock) } : book); if (!error) close(); return error }} />}
      {deleting && <ConfirmModal title="Eliminar libro" message={`¿Eliminar "${deleting.title}"?`} close={() => setDeleting(undefined)} confirm={() => { remove(deleting.id); setDeleting(undefined) }} />}
      {importing && (
        <ImportModal<BookDraft>
          title="Importar libros desde Excel"
          description="Columnas requeridas: Título, Autor, ISBN, Categoría, Stock. Las categorías nuevas se crean automáticamente y los ISBN repetidos se omiten."
          headers={['Título', 'Autor', 'ISBN', 'Categoría', 'Stock']}
          example={['Clean Architecture', 'Robert C. Martin', '978-0134494166', 'Tecnología', '3']}
          templateName="plantilla-libros"
          parse={parseRow}
          apply={importBooks}
          close={() => setImporting(false)}
        />
      )}
    </>
  )
}

function BookModal({ book, categories, close, save }: { book?: Book; categories: string[]; close: () => void; save: (book: BookDraft) => string | undefined }) {
  const [form, setForm] = useState<BookFields>({ title: book?.title ?? '', author: book?.author ?? '', isbn: book?.isbn ?? '', category: book?.category ?? categories[0] ?? '', stock: String(book?.stock ?? 1) })
  const [errors, setErrors] = useState<Partial<Record<keyof BookFields, string>>>({})
  const field = (key: keyof BookFields) => ({ value: form[key], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: event.target.value }) })

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const next = validateBook(form)
    setErrors(next)
    if (Object.keys(next).length) return
    const error = save({ title: form.title.trim(), author: form.author.trim(), isbn: form.isbn.trim(), category: form.category, stock: Number(form.stock) })
    if (error) setErrors({ isbn: error })
  }

  const err = (key: keyof BookFields) => errors[key] && <small className="field-error">{errors[key]}</small>
  return (
    <Modal title={book ? 'Editar libro' : 'Registrar libro'} close={close}>
      <form className="form-grid" onSubmit={submit} noValidate>
        <label>Título<input {...field('title')} />{err('title')}</label>
        <label>Autor<input {...field('author')} />{err('author')}</label>
        <label>ISBN<input {...field('isbn')} />{err('isbn')}</label>
        <label>Categoría<select {...field('category')}><option value="">Seleccione...</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>{err('category')}</label>
        <label>Stock disponible<input type="number" min="0" {...field('stock')} />{err('stock')}</label>
        <div className="modal-actions"><button type="button" className="outline-button" onClick={close}>Cancelar</button><button className="primary-button">Guardar</button></div>
      </form>
    </Modal>
  )
}

type UsersProps = {
  users: User[]
  save: (user: User | UserDraft) => string | undefined
  remove: (id: string) => void
  importUsers: (items: UserDraft[]) => void
}

export function UsersPage({ users, save, remove, importUsers }: UsersProps) {
  const [editing, setEditing] = useState<User | undefined>()
  const [deleting, setDeleting] = useState<User | undefined>()
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const pager = usePagination(users, 10)
  const close = () => { setOpen(false); setEditing(undefined) }

  const parseRow = (cells: string[], accepted: UserDraft[]) => {
    const [name, code, email, roleText] = cells
    const role = parseRole(roleText)
    if (!role) return { error: 'El tipo debe ser Estudiante o Docente.' }
    const errors = Object.values(validateUser({ name, code, email, role }))
    if (errors.length) return { error: errors.join(' ') }
    const upperCode = code.trim().toUpperCase()
    const taken = [...users, ...accepted]
    if (taken.some((user) => user.code.toUpperCase() === upperCode)) return { error: 'El código ya existe o está repetido en el archivo.' }
    if (taken.some((user) => user.email.toLowerCase() === email.trim().toLowerCase())) return { error: 'El correo ya existe o está repetido en el archivo.' }
    return { value: { name: name.trim().replace(/\s+/g, ' '), code: upperCode, email: email.trim(), role } }
  }

  return (
    <>
      <PageTitle title="Usuarios registrados" description="Gestiona estudiantes y docentes." action={
        <div className="title-actions">
          <button className="outline-button" onClick={() => setImporting(true)}><FileSpreadsheet size={17} /> Importar Excel</button>
          <button className="primary-button" onClick={() => setOpen(true)}><UserPlus size={17} /> Registrar usuario</button>
        </div>
      } />
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>USUARIO</th><th>CÓDIGO</th><th>CORREO</th><th>TIPO</th><th>ACCIONES</th></tr></thead>
            <tbody>
              {pager.items.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td><td>{user.code}</td><td>{user.email}</td><td><span className="tag">{user.role}</span></td>
                  <td className="actions">
                    <div className="action-group">
                      <IconButton label="Editar usuario" onClick={() => setEditing(user)}><Edit3 size={17} /></IconButton>
                      <IconButton label="Eliminar usuario" onClick={() => setDeleting(user)}><Trash2 size={17} /></IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={5} className="empty-state">No hay usuarios registrados.</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination pager={pager} />
      </div>
      {(open || editing) && <UserModal user={editing} close={close} save={(user) => { const error = save(editing ? { ...user, id: editing.id } : user); if (!error) close(); return error }} />}
      {deleting && <ConfirmModal title="Eliminar usuario" message={`¿Eliminar a ${deleting.name}?`} close={() => setDeleting(undefined)} confirm={() => { remove(deleting.id); setDeleting(undefined) }} />}
      {importing && (
        <ImportModal<UserDraft>
          title="Importar usuarios desde Excel"
          description="Columnas requeridas: Nombres y apellidos, Código, Correo, Tipo (Estudiante o Docente). Código de estudiante: 10 dígitos y una letra, ej. 2022100543M."
          headers={['Nombres y apellidos', 'Código', 'Correo', 'Tipo']}
          example={['María Fernanda López', '2022100543M', 'maria.lopez@universidad.edu', 'Estudiante']}
          templateName="plantilla-usuarios"
          parse={parseRow}
          apply={importUsers}
          close={() => setImporting(false)}
        />
      )}
    </>
  )
}

function UserModal({ user, close, save }: { user?: User; close: () => void; save: (user: UserDraft) => string | undefined }) {
  const [form, setForm] = useState<UserFields>({ name: user?.name ?? '', code: user?.code ?? '', email: user?.email ?? '', role: user?.role ?? 'Estudiante' })
  const [errors, setErrors] = useState<Partial<Record<keyof UserFields, string>>>({})
  const field = (key: keyof UserFields) => ({ value: form[key], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: event.target.value }) })

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const next = validateUser(form)
    setErrors(next)
    if (Object.keys(next).length) return
    const error = save({ name: form.name.trim().replace(/\s+/g, ' '), code: form.code.trim().toUpperCase(), email: form.email.trim(), role: form.role })
    if (error) setErrors({ code: error })
  }

  const err = (key: keyof UserFields) => errors[key] && <small className="field-error">{errors[key]}</small>
  return (
    <Modal title={user ? 'Editar usuario' : 'Registrar usuario'} close={close}>
      <form className="form-grid" onSubmit={submit} noValidate>
        <label className="full-field">Nombres y apellidos<input {...field('name')} />{err('name')}</label>
        <label>Tipo de usuario<select {...field('role')}><option>Estudiante</option><option>Docente</option></select></label>
        <label>Código universitario<input {...field('code')} placeholder={form.role === 'Estudiante' ? '2022100543M' : 'DOC-1008'} />{err('code')}</label>
        <label className="full-field">Correo electrónico<input type="email" {...field('email')} />{err('email')}</label>
        <div className="modal-actions"><button type="button" className="outline-button" onClick={close}>Cancelar</button><button className="primary-button">Guardar</button></div>
      </form>
    </Modal>
  )
}
