import type { ReactNode } from 'react'

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="page-title"><div><div className="eyebrow">BIBLIOTECA CENTRAL</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>
}
