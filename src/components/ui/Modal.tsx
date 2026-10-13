import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconButton } from './IconButton'

export function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h2>{title}</h2><IconButton label="Cerrar" onClick={close}><X size={19} /></IconButton></div>{children}</div></div>
}

export function ConfirmModal({ title, message, close, confirm }: { title: string; message: string; close: () => void; confirm: () => void }) {
  return <Modal title={title} close={close}><div className="confirmation-copy"><p>{message}</p></div><div className="modal-actions"><button className="outline-button" onClick={close}>Cancelar</button><button className="danger-button" onClick={confirm}>Sí, eliminar</button></div></Modal>
}
