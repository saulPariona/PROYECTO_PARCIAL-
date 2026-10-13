import type { ReactNode } from 'react'

export function IconButton({ label, onClick, children }: { label: string; onClick?: () => void; children: ReactNode }) {
  return <button className="icon-button" aria-label={label} title={label} onClick={onClick}>{children}</button>
}
