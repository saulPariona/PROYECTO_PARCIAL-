import { Edit3, Plus, Tag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Book } from '../types/library'
import { ConfirmModal, Modal } from '../components/ui/Modal'
import { PageTitle } from '../components/ui/PageTitle'
import { Pagination } from '../components/ui/Pagination'
import { usePagination } from '../lib/usePagination'

type CategoriesPageProps = {
  books: Book[]
  categories: string[]
  save: (oldName: string | undefined, name: string) => string | undefined
  remove: (name: string) => void
}

export function CategoriesPage({ books, categories, save, remove }: CategoriesPageProps) {
  const [editing, setEditing] = useState<string | undefined>()
  const [creating, setCreating] = useState(false)
  const [removing, setRemoving] = useState<string | undefined>()

  const pager = usePagination(categories, 9)

  const closeEditor = () => {
    setEditing(undefined)
    setCreating(false)
  }

  const openCreate = () => {
    setEditing(undefined)
    setCreating(true)
  }

  const submit = (name: string) => {
    const normalizedName = name.trim()
    if (normalizedName.length < 3) return 'El nombre debe tener al menos 3 caracteres.'
    const error = save(editing, normalizedName)
    if (!error) closeEditor()
    return error
  }

  return (
    <>
      <PageTitle
        title="Gestión de categorías"
        description="Organiza los libros de tu biblioteca."
        action={<button className="primary-button" onClick={openCreate}><Plus size={17} /> Añadir categoría</button>}
      />
      <div className="category-grid">
        {pager.items.map((category) => (
          <article className="category-card" key={category}>
            <div className="category-icon"><Tag size={19} /></div>
            <div className="category-info">
              <h2>{category}</h2>
              <p>{books.filter((book) => book.category === category).length} libros registrados</p>
            </div>
            <div className="category-actions">
              <button className="icon-button" aria-label={`Editar ${category}`} title={`Editar ${category}`} onClick={() => setEditing(category)}>
                <Edit3 size={16} />
              </button>
              <button className="icon-button" aria-label={`Eliminar ${category}`} title={`Eliminar ${category}`} onClick={() => setRemoving(category)}>
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <Pagination pager={pager} sizes={[6, 9, 18]} />
      {(creating || editing !== undefined) && (
        <CategoryModal
          category={editing}
          close={closeEditor}
          submit={submit}
        />
      )}
      {removing && (
        <ConfirmModal
          title="Eliminar categoría"
          message={`¿Deseas eliminar la categoría "${removing}"?`}
          close={() => setRemoving(undefined)}
          confirm={() => {
            remove(removing)
            setRemoving(undefined)
          }}
        />
      )}
    </>
  )
}

function CategoryModal({ category, close, submit }: { category?: string; close: () => void; submit: (name: string) => string | undefined }) {
  const [name, setName] = useState(category ?? '')
  const [error, setError] = useState('')

  return (
    <Modal title={category ? 'Editar categoría' : 'Registrar categoría'} close={close}>
      <form className="form-grid" noValidate onSubmit={(event) => { event.preventDefault(); setError(submit(name) ?? '') }}>
        <label className="full-field">Categoría<input autoFocus value={name} onChange={(event) => setName(event.target.value)} /></label>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="outline-button" onClick={close}>Cancelar</button>
          <button className="primary-button">Guardar</button>
        </div>
      </form>
    </Modal>
  )
}
