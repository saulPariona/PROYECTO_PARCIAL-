import { ArrowRight, BarChart3, BookOpen, CircleHelp, FileText, Library, PanelLeftClose, PanelLeftOpen, Tag, Users, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { IconButton } from '../ui/IconButton'

type SidebarProps = { open: boolean; close: () => void; isAdmin: boolean; collapsed: boolean; toggleCollapsed: () => void }

export function Sidebar({ open, close, isAdmin, collapsed, toggleCollapsed }: SidebarProps) {
  const item = (to: string, label: string, icon: ReactNode) => (
    <NavLink to={to} end={to === '/'} onClick={close} title={label} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>{icon}<span>{label}</span></NavLink>
  )
  return (
    <aside className={`sidebar ${open ? 'is-open' : ''} ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><Library size={20} /></div>
        <span>Biblio<span>Uni</span></span>
        <IconButton className="collapse-btn" label={collapsed ? 'Expandir menú' : 'Contraer menú'} onClick={toggleCollapsed}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</IconButton>
        <IconButton className="close-btn" label="Cerrar menú" onClick={close}><X size={18} /></IconButton>
      </div>
      <div className="sidebar-label">MENÚ PRINCIPAL</div>
      <nav className="nav-list">
        {isAdmin ? (
          <>{item('/', 'Resumen', <Library size={18} />)}{item('/catalogo', 'Catálogo', <BookOpen size={18} />)}{item('/prestamos', 'Préstamos', <FileText size={18} />)}{item('/reportes', 'Reportes', <BarChart3 size={18} />)}</>
        ) : (
          <>{item('/catalogo', 'Catálogo', <BookOpen size={18} />)}{item('/mis-prestamos', 'Mis préstamos', <FileText size={18} />)}</>
        )}
      </nav>
      {isAdmin && (
        <>
          <div className="sidebar-label management">GESTIÓN</div>
          <nav className="nav-list">{item('/libros', 'Libros', <Library size={18} />)}{item('/categorias', 'Categorías', <Tag size={18} />)}{item('/usuarios', 'Usuarios', <Users size={18} />)}</nav>
        </>
      )}
      <div className="sidebar-bottom">
        <div className="help-card"><strong>¿Necesitas ayuda?</strong><span>Consulta la guía del sistema</span><Link to="/guia" onClick={close}>Ver guía <ArrowRight size={14} /></Link></div>
        <div className="help-mini">{item('/guia', 'Guía', <CircleHelp size={18} />)}</div>
      </div>
    </aside>
  )
}