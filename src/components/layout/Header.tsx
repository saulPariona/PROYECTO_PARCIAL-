import { Bell, LogOut, Menu, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import type { Theme } from '../../lib/theme'
import { IconButton } from '../ui/IconButton'
import { ConfirmModal } from '../ui/Modal'

type HeaderProps = {
  name: string
  roleLabel: string
  logout: () => void
  openMenu: () => void
  theme: Theme
  toggleTheme: () => void
}

export function Header({ name, roleLabel, logout, openMenu, theme, toggleTheme }: HeaderProps) {
  const [confirmLogout, setConfirmLogout] = useState(false)

  return (
    <>
      <header className="topbar">
        <button className="mobile-menu" onClick={openMenu} aria-label="Abrir menú">
          <Menu size={22} />
        </button>
        <div className="breadcrumb">
          Inicio <span>/</span> <strong>Biblioteca Central</strong>
        </div>
        <div className="top-actions">
          <IconButton label={theme === 'dark' ? 'Tema día' : 'Tema noche'} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </IconButton>
          <IconButton label="Notificaciones">
            <Bell size={19} />
          </IconButton>
          <div className="profile">
            <div className="avatar">
              {name
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="profile-info">
              <strong>{name}</strong>
              <span>{roleLabel}</span>
            </div>
            <IconButton label="Cerrar sesión" onClick={() => setConfirmLogout(true)}>
              <LogOut size={18} />
            </IconButton>
          </div>
        </div>
      </header>
      {confirmLogout && (
        <ConfirmModal
          title="Cerrar sesión"
          message={`¿Estás seguro de que deseas cerrar la sesión actual de ${name}?`}
          confirmText="Sí, salir"
          variant="warning"
          close={() => setConfirmLogout(false)}
          confirm={() => {
            setConfirmLogout(false)
            logout()
          }}
        />
      )}
    </>
  )
}