export type LoanStatus = 'Activo' | 'Devuelto'
export type UserRole = 'Estudiante' | 'Docente'

export type Book = {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  stock: number
  total: number
}

export type User = {
  id: string
  name: string
  code: string
  email: string
  role: UserRole
}

export type Loan = {
  id: string
  userId: string
  bookId: string
  borrowedAt: string
  dueAt: string
  returnedAt?: string
  status: LoanStatus
}
