import type { ReactNode } from 'react'

type IconButtonProps = { label: string; onClick?: () => void; children: ReactNode; className?: string }

export function IconButton({ label, onClick, children, className = '' }: IconButtonProps) {
  return <button className={`icon-button ${className}`.trim()} aria-label={label} title={label} onClick={onClick}>{children}</button>
}
