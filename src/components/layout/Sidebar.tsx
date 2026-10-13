import { ArrowRight, BookOpen, FileText, Library, Tag, Users, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { IconButton } from '../ui/IconButton'

export function Sidebar({ open, close }: { open: boolean; close: () => void }) {
  const item = (to: string, label: string, icon: React.ReactNode) => <NavLink to={to} end={to === '/'} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>{icon}<span>{label}</span></NavLink>
  return <aside className={`sidebar ${open ? 'is-open' : ''}`}><div className="brand"><div className="brand-mark"><Library size={20} /></div><span>Biblio<span>Uni</span></span><IconButton label="Cerrar menú" onClick={close}><X size={18} /></IconButton></div><div className="sidebar-label">MENÚ PRINCIPAL</div><nav className="nav-list">{item('/', 'Resumen', <Library size={18} />)}{item('/catalogo', 'Catálogo', <BookOpen size={18} />)}{item('/prestamos', 'Préstamos', <FileText size={18} />)}</nav><div className="sidebar-label management">GESTIÓN</div><nav className="nav-list">{item('/libros', 'Libros', <Library size={18} />)}{item('/categorias', 'Categorías', <Tag size={18} />)}{item('/usuarios', 'Usuarios', <Users size={18} />)}</nav><div className="sidebar-bottom"><div className="help-card"><strong>¿Necesitas ayuda?</strong><span>Consulta la guía del sistema</span><Link to="/guia">Ver guía <ArrowRight size={14} /></Link></div></div></aside>
}
