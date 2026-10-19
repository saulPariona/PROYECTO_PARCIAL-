import { useState } from 'react'
import { BookOpen, Moon, Sun } from 'lucide-react'
import type { Theme } from '../lib/theme'
import type { Session, User } from '../types/library'

type Props = {
  users: User[]
  loginAdmin: (username: string, password: string) => boolean
  loginUser: (code: string) => Session | undefined
  theme: Theme
  toggleTheme: () => void
}

export function LoginPage({ loginAdmin, loginUser, theme, toggleTheme }: Props) {
  const [mode, setMode] = useState<'user' | 'admin'>('user')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const changeMode = (next: 'user' | 'admin') => { setMode(next); setError('') }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (mode === 'admin') {
      if (!username.trim() || !password) return setError('Ingresa usuario y contraseña.')
      if (!loginAdmin(username.trim(), password)) setError('Usuario o contraseña incorrectos.')
    } else {
      if (!code.trim()) return setError('Ingresa tu código universitario.')
      if (!loginUser(code.trim())) setError('Código no registrado. Solicítalo al administrador.')
    }
  }

  return (
    <div className="login-page">
      <button type="button" className="icon-button login-theme" onClick={toggleTheme} title={theme === 'dark' ? 'Tema día' : 'Tema noche'} aria-label="Cambiar tema">{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}</button>
      <form className="login-card" onSubmit={submit} noValidate>
        <div className="receipt-brand login-brand">
          <div className="brand-mark"><BookOpen size={20} /></div>
          <strong>Biblio<span>Uni</span></strong>
        </div>
        <h1>Iniciar sesión</h1>
        <p className="login-subtitle">Sistema de gestión de la Biblioteca Central.</p>
        <div className="login-tabs">
          <button type="button" className={mode === 'user' ? 'active' : ''} onClick={() => changeMode('user')}>Estudiante / Docente</button>
          <button type="button" className={mode === 'admin' ? 'active' : ''} onClick={() => changeMode('admin')}>Administrador</button>
        </div>
        {mode === 'admin' ? (
          <>
            <label className="login-field">Usuario<input value={username} onChange={(event) => setUsername(event.target.value)} autoFocus /></label>
            <label className="login-field">Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          </>
        ) : (
          <label className="login-field">Código universitario<input value={code} onChange={(event) => setCode(event.target.value)} autoFocus /></label>
        )}
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button login-submit">Ingresar</button>
        <p className="login-hint">{mode === 'admin' ? 'Demo: admin / admin123' : 'Demo: 2022100543M (estudiante) · DOC-1008 (docente)'}</p>
      </form>
    </div>
  )
}
