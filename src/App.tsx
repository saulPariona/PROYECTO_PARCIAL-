import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { readStorage, getStoredUsers, seedUsers, writeStorage } from './lib/storage'
import { CategoriesPage } from './pages/CategoriesPage'
import { Books, Catalog, Dashboard, Guide, Loans, Receipt, UsersPage } from './pages/LibraryPages'
import type { Book, Loan, User } from './types/library'

const seedBooks: Book[] = [
  { id: 'b1', title: 'Cien años de soledad', author: 'Gabriel García Márquez', isbn: '978-0307474728', category: 'Literatura', stock: 4, total: 5 },
  { id: 'b2', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', category: 'Tecnología', stock: 2, total: 3 },
  { id: 'b3', title: 'El principito', author: 'Antoine de Saint-Exupéry', isbn: '978-0156012195', category: 'Literatura', stock: 6, total: 6 },
]
const seedLoans: Loan[] = [{ id: 'PRE-24001', userId: 'u1', bookId: 'b2', borrowedAt: '2025-05-12', dueAt: '2025-05-26', status: 'Activo' }]
const defaultCategories = ['Literatura', 'Tecnología', 'Ciencias sociales', 'Ciencias exactas']

export default function App() {
  const [books, setBooks] = useState(() => readStorage('biblio-books', seedBooks))
  const [users, setUsers] = useState(getStoredUsers)
  const [loans, setLoans] = useState(() => readStorage('biblio-loans', seedLoans))
  const [categories, setCategories] = useState(() => readStorage('biblio-categories', defaultCategories))
  const [currentUser, setCurrentUser] = useState<User>(() => getStoredUsers()[0] ?? seedUsers[0])
  const [menuOpen, setMenuOpen] = useState(false); const [notice, setNotice] = useState('')
  useEffect(() => writeStorage('biblio-books', books), [books]); useEffect(() => { writeStorage('biblio-users', users); writeStorage('users', users) }, [users]); useEffect(() => writeStorage('biblio-loans', loans), [loans]); useEffect(() => writeStorage('biblio-categories', categories), [categories])
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 3000) }
  const saveBook = (book: Book | Omit<Book, 'id' | 'total'>) => { setBooks((items) => 'id' in book ? items.map((item) => item.id === book.id ? book : item) : [{ ...book, id: `b${Date.now()}`, total: book.stock }, ...items]); notify('Libro guardado correctamente.') }
  const removeBook = (id: string) => { setBooks((items) => items.filter((item) => item.id !== id)); notify('Libro eliminado correctamente.') }
  const saveUser = (user: User | Omit<User, 'id'>) => { setUsers((items) => 'id' in user ? items.map((item) => item.id === user.id ? user : item) : [{ ...user, id: `u${Date.now()}` }, ...items]); notify('Usuario guardado correctamente.') }
  const removeUser = (id: string) => { if (loans.some((loan) => loan.userId === id && loan.status === 'Activo')) return notify('No se puede eliminar un usuario con préstamos activos.'); setUsers((items) => items.filter((item) => item.id !== id)); notify('Usuario eliminado correctamente.') }
  const borrow = (bookId: string, userId: string) => { const book = books.find((item) => item.id === bookId); if (!book || book.stock < 1) return; const due = new Date(); due.setDate(due.getDate() + 14); setBooks((items) => items.map((item) => item.id === bookId ? { ...item, stock: item.stock - 1 } : item)); setLoans((items) => [{ id: `PRE-${Date.now().toString().slice(-6)}`, userId, bookId, borrowedAt: new Date().toISOString().slice(0, 10), dueAt: due.toISOString().slice(0, 10), status: 'Activo' }, ...items]); notify('Préstamo registrado correctamente.') }
  const returnLoan = (id: string) => { const loan = loans.find((item) => item.id === id); if (!loan) return; setLoans((items) => items.map((item) => item.id === id ? { ...item, status: 'Devuelto', returnedAt: new Date().toISOString().slice(0, 10) } : item)); setBooks((items) => items.map((item) => item.id === loan.bookId ? { ...item, stock: item.stock + 1 } : item)); notify('Devolución registrada correctamente.') }
  const saveCategory = (oldName: string | undefined, name: string) => { setCategories((items) => oldName ? items.map((item) => item === oldName ? name : item) : [...items, name]); if (oldName) setBooks((items) => items.map((book) => book.category === oldName ? { ...book, category: name } : book)); notify('Categoría guardada correctamente.') }
  const removeCategory = (name: string) => { if (books.some((book) => book.category === name)) return notify('No se puede eliminar una categoría con libros relacionados.'); setCategories((items) => items.filter((item) => item !== name)); notify('Categoría eliminada correctamente.') }
  const { pathname } = useLocation()
  const loanFromUrl = pathname.split('/').pop(); const activeLoan = loans.find((loan) => loan.id === loanFromUrl)
  return <div className="app-shell"><Sidebar open={menuOpen} close={() => setMenuOpen(false)} /><div className="main-area"><Header users={users} currentUser={currentUser} setCurrentUser={setCurrentUser} openMenu={() => setMenuOpen(true)} /><main className="page-content"><Routes><Route path="/" element={<Dashboard books={books} users={users} loans={loans} />} /><Route path="/catalogo" element={<Catalog books={books} users={users} borrow={borrow} />} /><Route path="/prestamos" element={<Loans books={books} users={users} loans={loans} returnLoan={returnLoan} />} /><Route path="/libros" element={<Books books={books} categories={categories} save={saveBook} remove={removeBook} />} /><Route path="/usuarios" element={<UsersPage users={users} save={saveUser} remove={removeUser} />} /><Route path="/categorias" element={<CategoriesPage books={books} categories={categories} save={saveCategory} remove={removeCategory} />} /><Route path="/guia" element={<Guide />} /><Route path="/comprobante/:loanId" element={<Receipt loan={activeLoan} book={books.find((book) => book.id === activeLoan?.bookId)} user={users.find((user) => user.id === activeLoan?.userId)} />} /></Routes></main></div>{notice && <div className="toast"><CheckCircle size={18} />{notice}</div>}</div>
}
