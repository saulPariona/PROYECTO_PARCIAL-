import { useState } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { downloadXlsx, readSheet } from '../../lib/excel'
import { normalizeText } from '../../lib/validation'
import { Modal } from './Modal'

type Parsed<T> = { value?: T; error?: string }
type Result<T> = { row: number } & Parsed<T>

type Props<T> = {
  title: string
  description: string
  headers: string[]
  example: string[]
  templateName: string
  /** Valida una fila; recibe las filas ya aceptadas para detectar duplicados dentro del archivo. */
  parse: (cells: string[], accepted: T[]) => Parsed<T>
  apply: (items: T[]) => void
  close: () => void
}

export function ImportModal<T>({ title, description, headers, example, templateName, parse, apply, close }: Props<T>) {
  const [fileName, setFileName] = useState('')
  const [fatal, setFatal] = useState('')
  const [results, setResults] = useState<Result<T>[]>([])
  const [busy, setBusy] = useState(false)

  const valid = results.filter((item) => item.value).map((item) => item.value as T)
  const invalid = results.filter((item) => item.error)

  const onFile = async (file?: File) => {
    if (!file) return
    setFileName(file.name)
    setFatal('')
    setResults([])
    if (!file.name.toLowerCase().endsWith('.xlsx')) return setFatal('Selecciona un archivo de Excel (.xlsx).')
    setBusy(true)
    try {
      const [head, ...body] = await readSheet(file)
      if (!head || headers.some((header, index) => normalizeText(head[index] ?? '') !== normalizeText(header))) {
        setFatal(`La primera fila debe contener los encabezados: ${headers.join(', ')}. Descarga la plantilla.`)
      } else {
        const accepted: T[] = []
        const output: Result<T>[] = []
        body.forEach((cells, index) => {
          if (cells.every((cell) => !cell.trim())) return
          const parsed = parse(cells, accepted)
          if (parsed.value) accepted.push(parsed.value)
          output.push({ row: index + 2, ...parsed })
        })
        if (output.length === 0) setFatal('El archivo no contiene filas de datos.')
        setResults(output)
      }
    } catch {
      setFatal('No se pudo leer el archivo. Verifica que sea un .xlsx válido.')
    }
    setBusy(false)
  }

  return (
    <Modal title={title} close={close}>
      <p className="import-help">{description}</p>
      <div className="import-actions">
        <button type="button" className="outline-button" onClick={() => downloadXlsx(templateName, 'Plantilla', headers, [example])}><Download size={16} /> Descargar plantilla</button>
        <label className="outline-button file-button"><FileSpreadsheet size={16} /> {fileName || 'Seleccionar archivo .xlsx'}
          <input type="file" accept=".xlsx" hidden onChange={(event) => { onFile(event.target.files?.[0]); event.target.value = '' }} />
        </label>
      </div>
      {busy && <p className="import-help">Procesando archivo…</p>}
      {fatal && <p className="form-error import-error">{fatal}</p>}
      {results.length > 0 && (
        <div className="import-summary">
          <p><strong className="available">{valid.length}</strong> filas válidas · <strong className={invalid.length ? 'unavailable' : ''}>{invalid.length}</strong> con errores (se omitirán)</p>
          {invalid.length > 0 && (
            <ul className="import-errors">
              {invalid.slice(0, 50).map((item) => <li key={item.row}>Fila {item.row}: {item.error}</li>)}
              {invalid.length > 50 && <li>… y {invalid.length - 50} más</li>}
            </ul>
          )}
        </div>
      )}
      <div className="modal-actions import-footer">
        <button type="button" className="outline-button" onClick={close}>Cancelar</button>
        <button type="button" className="primary-button" disabled={valid.length === 0} onClick={() => { apply(valid); close() }}>Importar {valid.length || ''} registros</button>
      </div>
    </Modal>
  )
}
