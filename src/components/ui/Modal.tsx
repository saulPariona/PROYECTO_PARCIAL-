import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { IconButton } from './IconButton'

export function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <IconButton label="Cerrar" onClick={close}>
            <X size={19} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  )
}

export type ConfirmVariant = 'danger' | 'primary' | 'warning'

type ConfirmModalProps = {
  title: string
  message: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
  close: () => void
  confirm: () => void
}

export function ConfirmModal({
  title,
  message,
  confirmText = 'Sí, eliminar',
  cancelText = 'Cancelar',
  variant = 'danger',
  close,
  confirm,
}: ConfirmModalProps) {
  const icon =
    variant === 'danger' ? (
      <AlertTriangle size={22} />
    ) : variant === 'warning' ? (
      <Info size={22} />
    ) : (
      <CheckCircle2 size={22} />
    )

  return (
    <Modal title={title} close={close}>
      <div className={`confirmation-copy ${variant}`}>
        <div className="confirmation-icon">{icon}</div>
        <div>
          <p>{message}</p>
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="outline-button" onClick={close}>
          {cancelText}
        </button>
        <button
          type="button"
          className={variant === 'danger' ? 'danger-button' : 'primary-button'}
          onClick={confirm}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}
