import type { User, UserRole } from '../types/library'

/** Estudiantes: 10 dígitos + 1 letra (ej. 2022100543M). Docentes: alfanumérico con guion (ej. DOC-1008). */
export const STUDENT_CODE = /^\d{10}[A-Za-z]$/
export const STAFF_CODE = /^[A-Za-z0-9-]{4,15}$/
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateCode(code: string, role: UserRole) {
  const value = code.trim()
  if (role === 'Estudiante') return STUDENT_CODE.test(value) ? undefined : 'El código de estudiante debe tener 10 dígitos y una letra (ej. 2022100543M).'
  return STAFF_CODE.test(value) ? undefined : 'Código de docente de 4 a 15 caracteres (letras, números o guion).'
}

export type BookFields = { title: string; author: string; isbn: string; category: string; stock: string }

export function validateBook(fields: BookFields) {
  const errors: Partial<Record<keyof BookFields, string>> = {}
  if (fields.title.trim().length < 2) errors.title = 'Ingresa el título del libro.'
  if (fields.author.trim().length < 3) errors.author = 'Ingresa el autor.'
  if (!/^[\d-]{10,17}$/.test(fields.isbn.trim())) errors.isbn = 'ISBN inválido (10 a 17 dígitos o guiones).'
  if (!fields.category.trim()) errors.category = 'Selecciona una categoría.'
  if (!/^\d+$/.test(fields.stock.trim())) errors.stock = 'El stock debe ser un entero mayor o igual a 0.'
  return errors
}

export type UserFields = { name: string; code: string; email: string; role: UserRole }

export function validateUser(fields: UserFields) {
  const errors: Partial<Record<keyof UserFields, string>> = {}
  if (fields.name.trim().split(/\s+/).length < 2) errors.name = 'Ingresa nombres y apellidos.'
  const codeError = validateCode(fields.code, fields.role)
  if (codeError) errors.code = codeError
  if (!EMAIL.test(fields.email.trim())) errors.email = 'Correo electrónico inválido.'
  return errors
}

export const normalizeText = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()

export function parseRole(text: string): UserRole | undefined {
  const value = normalizeText(text)
  if (value === 'estudiante') return 'Estudiante'
  if (value === 'docente') return 'Docente'
  return undefined
}

export type UserDraft = Omit<User, 'id'>
