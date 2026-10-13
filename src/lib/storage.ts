import type { User } from '../types/library'

export const seedUsers: User[] = [
  { id: 'u1', name: 'María Fernanda López', code: '20240001', email: 'maria.lopez@universidad.edu', role: 'Estudiante' },
  { id: 'u2', name: 'Carlos Ramírez Soto', code: 'DOC-1008', email: 'carlos.ramirez@universidad.edu', role: 'Docente' },
]

export function readStorage<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getStoredUsers(): User[] {
  const legacy = readStorage<Partial<User>[]>('users', [])
  const saved = legacy.length ? legacy : readStorage<User[]>('biblio-users', seedUsers)
  return saved.filter((user) => user.id && user.name && user.code && user.email).map((user) => ({
    id: user.id as string,
    name: user.name as string,
    code: user.code as string,
    email: user.email as string,
    role: user.role === 'Docente' ? 'Docente' : 'Estudiante',
  }))
}
