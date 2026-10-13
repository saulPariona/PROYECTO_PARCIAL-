import { Bell, ChevronDown, Menu } from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import type { User } from '../../types/library'

export function Header({ users, currentUser, setCurrentUser, openMenu }: { users: User[]; currentUser: User; setCurrentUser: (user: User) => void; openMenu: () => void }) {
  return <header className="topbar"><button className="mobile-menu" onClick={openMenu}><Menu size={22} /></button><div className="breadcrumb">Inicio <span>/</span> <strong>Biblioteca</strong></div><div className="top-actions"><IconButton label="Notificaciones"><Bell size={19} /></IconButton><div className="profile"><div className="avatar">{currentUser.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><select value={currentUser.id} onChange={(event) => { const user = users.find((item) => item.id === event.target.value); if (user) setCurrentUser(user) }}>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select><ChevronDown size={15} /></div></div></header>
}
