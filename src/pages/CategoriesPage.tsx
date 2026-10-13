import { Edit3, Plus, Tag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Book } from '../types/library'
import { ConfirmModal, Modal } from '../components/ui/Modal'
import { PageTitle } from '../components/ui/PageTitle'

type CategoriesPageProps = {
  books: Book[]
  categories: string[]
  save: (oldName: string | undefined, name: string) => void
  remove: (name: string) => void
}

export function CategoriesPage({ books, categories, save, remove }: CategoriesPageProps) {
  const [editing, setEditing] = useState<string | undefined>()
  const [creating, setCreating] = useState(false)
  const [removing, setRemoving] = useState<string | undefined>()

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
    if (!normalizedName) return
    save(editing, normalizedName)
    closeEditor()
  }

  return (
    <>
      <PageTitle
        title="Gestión de categorías"
        description="Organiza los libros de tu biblioteca."
        action={<button className="primary-button" onClick={openCreate}><Plus size={17} /> Añadir categoría</button>}
      />
      <div className="category-grid">
        {categories.map((category) => (
          <article className="category-card" key={category}>
            <div className="category-icon"><Tag size={19} /></div>
            <div>
              <h2>{category}</h2>
              <p>{books.filter((book) => book.category === category).length} libros registrados</p>
            </div>
            <button className="icon-button" aria-label={`Editar ${category}`} title={`Editar ${category}`} onClick={() => setEditing(category)}>
              <Edit3 size={16} />
            </button>
            <button className="icon-button" aria-label={`Eliminar ${category}`} title={`Eliminar ${category}`} onClick={() => setRemoving(category)}>
              <Trash2 size={16} />
            </button>
          </article>
        ))}
      </div>
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

function CategoryModal({ category, close, submit }: { category?: string; close: () => void; submit: (name: string) => void }) {
  const [name, setName] = useState(category ?? '')

  return (
    <Modal title={category ? 'Editar categoría' : 'Registrar categoría'} close={close}>
      <form className="form-grid" onSubmit={(event) => { event.preventDefault(); submit(name) }}>
        <label>Categoría<input required autoFocus value={name} onChange={(event) => setName(event.target.value)} /></label>
        <div className="modal-actions">
          <button type="button" className="outline-button" onClick={close}>Cancelar</button>
          <button className="primary-button">Guardar</button>
        </div>
      </form>
    </Modal>
  )
}
