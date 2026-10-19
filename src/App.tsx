import { useEffect, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactElement } from 'react'
import './App.css'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { addDays, toISODate } from './lib/dates'
import { readStorage, getStoredUsers, writeStorage } from './lib/storage'
import { useTheme } from './lib/theme'
import { CategoriesPage } from './pages/CategoriesPage'
import { LoginPage } from './pages/LoginPage'
import { ReceiptPage } from './pages/ReceiptPage'
import { Books, Catalog, Dashboard, Guide, Loans, MyLoans, UsersPage } from './pages/LibraryPages'
import type { BookDraft } from './pages/LibraryPages'
import { ReportsPage } from './pages/ReportsPage'
import type { UserDraft } from './lib/validation'
import type { Book, BorrowResult, Loan, Receipt, Session, User } from './types/library'

const ADMIN_USER = 'admin'
const ADMIN_PASSWORD = 'admin123'

const seedBooks: Book[] = [
  { id: 'b1', title: 'Cien años de soledad', author: 'Gabriel García Márquez', isbn: '978-0307474728', category: 'Literatura', stock: 4, total: 5 },
  { id: 'b2', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', category: 'Tecnología', stock: 2, total: 3 },
  { id: 'b3', title: 'El principito', author: 'Antoine de Saint-Exupéry', isbn: '978-0156012195', category: 'Literatura', stock: 6, total: 6 },
]
const seedLoans: Loan[] = [{ id: 'PRE-24001', userId: 'u1', bookId: 'b2', borrowedAt: '2025-05-12', dueAt: '2025-05-26', status: 'Activo' }]
const defaultCategories = ['Literatura', 'Tecnología', 'Ciencias sociales', 'Ciencias exactas']

type Notice = { text: string; type: 'success' | 'error' | 'warning' }

export default function App() {
  const [books, setBooks] = useState(() => readStorage('biblio-books', seedBooks))
  const [users, setUsers] = useState(getStoredUsers)
  const [loans, setLoans] = useState(() => readStorage('biblio-loans', seedLoans))
  const [categories, setCategories] = useState(() => readStorage('biblio-categories', defaultCategories))
  const [receipts, setReceipts] = useState(() => readStorage<Receipt[]>('biblio-receipts', []))
  const [session, setSession] = useState(() => readStorage<Session | null>('biblio-session', null))
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => readStorage('biblio-sidebar-collapsed', false))
  const [theme, toggleTheme] = useTheme()
  const [notice, setNotice] = useState<Notice | null>(null)
  const { pathname } = useLocation()

  useEffect(() => writeStorage('biblio-books', books), [books])
  useEffect(() => { writeStorage('biblio-users', users); writeStorage('users', users) }, [users])
  useEffect(() => writeStorage('biblio-loans', loans), [loans])
  useEffect(() => writeStorage('biblio-categories', categories), [categories])
  useEffect(() => writeStorage('biblio-receipts', receipts), [receipts])
  useEffect(() => writeStorage('biblio-session', session), [session])
  useEffect(() => writeStorage('biblio-sidebar-collapsed', collapsed), [collapsed])

  const notify = (text: string, type: Notice['type'] = 'success') => {
    setNotice({ text, type })
    window.setTimeout(() => setNotice((current) => (current?.text === text ? null : current)), 3500)
  }

  const currentUser = session?.role === 'user' ? users.find((user) => user.id === session.userId) : undefined
  const isAdmin = session?.role === 'admin'

  const loginAdmin = (username: string, password: string) => {
    if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) return false
    setSession({ role: 'admin' })
    notify('Sesión iniciada como Administrador.')
    return true
  }
  const loginUser = (code: string) => {
    const user = users.find((item) => item.code.toLowerCase() === code.toLowerCase())
    if (!user) return undefined
    const next: Session = { role: 'user', userId: user.id }
    setSession(next)
    notify(`Bienvenido(a), ${user.name}.`)
    return next
  }
  const logout = () => { setSession(null); setMenuOpen(false); notify('Has cerrado sesión correctamente.') }

  const saveBook = (book: Book | Omit<Book, 'id' | 'total'>) => {
    const id = 'id' in book ? book.id : undefined
    if (books.some((item) => item.id !== id && item.isbn === book.isbn)) return 'Ya existe un libro con ese ISBN.'
    setBooks((items) => id ? items.map((item) => item.id === id ? (book as Book) : item) : [{ ...book, id: `b${Date.now()}`, total: book.stock }, ...items])
    notify(id ? 'Libro actualizado correctamente.' : 'Libro registrado correctamente.')
  }
  const removeBook = (id: string) => {
    if (loans.some((loan) => loan.bookId === id && loan.status === 'Activo')) return notify('No se puede eliminar un libro con préstamos activos.', 'error')
    setBooks((items) => items.filter((item) => item.id !== id))
    notify('Libro eliminado correctamente.')
  }

  const importBooks = (items: BookDraft[]) => {
    const newCategories = [...new Set(items.map((item) => item.category))].filter((name) => !categories.some((item) => item.toLowerCase() === name.toLowerCase()))
    if (newCategories.length) setCategories((current) => [...current, ...newCategories])
    setBooks((current) => [...items.map((item, index) => ({ ...item, id: `b${Date.now()}-${index}`, total: item.stock })), ...current])
    notify(`${items.length} libros importados correctamente.`)
  }
  const importUsers = (items: UserDraft[]) => {
    setUsers((current) => [...items.map((item, index) => ({ ...item, id: `u${Date.now()}-${index}` })), ...current])
    notify(`${items.length} usuarios importados correctamente.`)
  }

  const saveUser = (user: User | Omit<User, 'id'>) => {
    const id = 'id' in user ? user.id : undefined
    if (users.some((item) => item.id !== id && item.code.toLowerCase() === user.code.toLowerCase())) return 'El código universitario ya está registrado.'
    if (users.some((item) => item.id !== id && item.email.toLowerCase() === user.email.toLowerCase())) return 'El correo ya está registrado.'
    setUsers((items) => id ? items.map((item) => item.id === id ? (user as User) : item) : [{ ...user, id: `u${Date.now()}` }, ...items])
    notify(id ? 'Usuario actualizado correctamente.' : 'Usuario registrado correctamente.')
  }
  const removeUser = (id: string) => {
    if (loans.some((loan) => loan.userId === id && loan.status === 'Activo')) return notify('No se puede eliminar un usuario con préstamos activos.', 'error')
    setUsers((items) => items.filter((item) => item.id !== id))
    notify('Usuario eliminado correctamente.')
  }

  const borrow = (bookId: string, userId: string): BorrowResult => {
    const book = books.find((item) => item.id === bookId)
    const user = users.find((item) => item.id === userId)
    if (!book || !user) return { error: 'Libro o usuario no encontrado.' }
    if (book.stock < 1) { notify('No hay stock disponible de este libro.', 'error'); return { error: 'Sin stock' } }
    if (loans.some((loan) => loan.userId === userId && loan.bookId === bookId && loan.status === 'Activo')) {
      notify('El usuario ya tiene un préstamo activo de este libro.', 'warning')
      return { error: 'Préstamo duplicado' }
    }
    let id = ''
    do { id = `PRE-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}` } while (loans.some((loan) => loan.id === id))
    const borrowedAt = toISODate()
    const dueAt = addDays(user.role === 'Docente' ? 14 : 7)
    setBooks((items) => items.map((item) => item.id === bookId ? { ...item, stock: item.stock - 1 } : item))
    setLoans((items) => [{ id, userId, bookId, borrowedAt, dueAt, status: 'Activo' }, ...items])
    setReceipts((items) => [{ code: id, userId, userName: user.name, userCode: user.code, bookTitle: book.title, bookAuthor: book.author, borrowedAt, dueAt }, ...items])
    notify('Préstamo registrado correctamente. Comprobante generado.')
    return { id }
  }

  const returnLoan = (id: string) => {
    const loan = loans.find((item) => item.id === id)
    if (!loan || loan.status === 'Devuelto') return
    setLoans((items) => items.map((item) => item.id === id ? { ...item, status: 'Devuelto', returnedAt: toISODate() } : item))
    setBooks((items) => items.map((item) => item.id === loan.bookId ? { ...item, stock: item.stock + 1 } : item))
    notify('Devolución registrada y stock actualizado.')
  }

  const saveCategory = (oldName: string | undefined, name: string) => {
    if (categories.some((item) => item !== oldName && item.toLowerCase() === name.toLowerCase())) return 'Ya existe una categoría con ese nombre.'
    setCategories((items) => oldName ? items.map((item) => item === oldName ? name : item) : [...items, name])
    if (oldName) setBooks((items) => items.map((book) => book.category === oldName ? { ...book, category: name } : book))
    notify(oldName ? 'Categoría actualizada correctamente.' : 'Categoría registrada correctamente.')
  }
  const removeCategory = (name: string) => {
    if (books.some((book) => book.category === name)) return notify('No se puede eliminar una categoría con libros relacionados.', 'error')
    setCategories((items) => items.filter((item) => item !== name))
    notify('Categoría eliminada correctamente.')
  }

  if (!session || (session.role === 'user' && !currentUser)) return <LoginPage users={users} loginAdmin={loginAdmin} loginUser={loginUser} theme={theme} toggleTheme={toggleTheme} />

  // El comprobante se toma de Local Storage; si el préstamo es antiguo, se reconstruye desde sus datos.
  const loanId = pathname.split('/').pop()
  const loan = loans.find((item) => item.id === loanId)
  const canSee = loan && (isAdmin || loan.userId === currentUser?.id)
  const loanBook = books.find((book) => book.id === loan?.bookId)
  const loanUser = users.find((user) => user.id === loan?.userId)
  const receipt: Receipt | undefined = !loan || !canSee ? undefined : receipts.find((item) => item.code === loan.id) ?? {
    code: loan.id, userId: loan.userId, userName: loanUser?.name ?? '—', userCode: loanUser?.code ?? '—',
    bookTitle: loanBook?.title ?? '—', bookAuthor: loanBook?.author ?? '—', borrowedAt: loan.borrowedAt, dueAt: loan.dueAt,
  }

  const adminOnly = (element: ReactElement) => isAdmin ? element : <Navigate to="/catalogo" replace />
  const myLoans = loans.filter((item) => item.userId === currentUser?.id)

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} close={() => setMenuOpen(false)} isAdmin={isAdmin} collapsed={collapsed} toggleCollapsed={() => setCollapsed((value) => !value)} />
      <div className="main-area">
        <Header name={isAdmin ? 'Administrador' : currentUser!.name} roleLabel={isAdmin ? 'Administrador' : currentUser!.role} logout={logout} openMenu={() => setMenuOpen(true)} theme={theme} toggleTheme={toggleTheme} />
        <main className="page-content">
          <Routes>
            <Route path="/" element={isAdmin ? <Dashboard books={books} users={users} loans={loans} /> : <Navigate to="/catalogo" replace />} />
            <Route path="/catalogo" element={<Catalog books={books} categories={categories} users={users} currentUser={currentUser} borrow={borrow} />} />
            <Route path="/prestamos" element={adminOnly(<Loans books={books} users={users} loans={loans} returnLoan={returnLoan} />)} />
            <Route path="/mis-prestamos" element={<MyLoans books={books} loans={myLoans} />} />
            <Route path="/libros" element={adminOnly(<Books books={books} categories={categories} save={saveBook} remove={removeBook} importBooks={importBooks} />)} />
            <Route path="/usuarios" element={adminOnly(<UsersPage users={users} save={saveUser} remove={removeUser} importUsers={importUsers} />)} />
            <Route path="/categorias" element={adminOnly(<CategoriesPage books={books} categories={categories} save={saveCategory} remove={removeCategory} />)} />
            <Route path="/reportes" element={adminOnly(<ReportsPage books={books} users={users} loans={loans} categories={categories} />)} />
            <Route path="/guia" element={<Guide isAdmin={isAdmin} />} />
            <Route path="/comprobante/:loanId" element={<ReceiptPage receipt={receipt} backTo={isAdmin ? '/prestamos' : '/mis-prestamos'} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {notice && (
        <div className={`toast toast-${notice.type}`} role="alert">
          {notice.type === 'error' ? <AlertCircle size={18} /> : notice.type === 'warning' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span>{notice.text}</span>
          <button type="button" className="toast-close" onClick={() => setNotice(null)} aria-label="Cerrar alerta"><X size={15} /></button>
        </div>
      )}
    </div>
  )
}
