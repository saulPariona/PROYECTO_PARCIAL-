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

/** Comprobante digital guardado en Local Storage al registrar un préstamo. */
export type Receipt = {
  code: string
  userId: string
  userName: string
  userCode: string
  bookTitle: string
  bookAuthor: string
  borrowedAt: string
  dueAt: string
}

export type Session = { role: 'admin' } | { role: 'user'; userId: string }

export type BorrowResult = { id?: string; error?: string }
