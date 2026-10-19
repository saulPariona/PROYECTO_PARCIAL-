import { CheckCircle, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../lib/dates'
import type { Receipt } from '../types/library'

async function downloadPdf(receipt: Receipt) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  doc.setFontSize(20)
  doc.text('BiblioUni - Biblioteca Central', 105, 25, { align: 'center' })
  doc.setFontSize(14)
  doc.text('Comprobante de préstamo', 105, 36, { align: 'center' })
  doc.line(20, 42, 190, 42)
  doc.setFontSize(12)
  const rows: [string, string][] = [
    ['Código del préstamo', receipt.code],
    ['Usuario', `${receipt.userName} (${receipt.userCode})`],
    ['Libro prestado', receipt.bookTitle],
    ['Autor', receipt.bookAuthor],
    ['Fecha de préstamo', formatDate(receipt.borrowedAt)],
    ['Fecha límite de devolución', formatDate(receipt.dueAt)],
  ]
  rows.forEach(([label, value], index) => {
    const y = 58 + index * 12
    doc.setFont('helvetica', 'bold')
    doc.text(`${label}:`, 20, y)
    doc.setFont('helvetica', 'normal')
    doc.text(value, 85, y)
  })
  doc.setFontSize(10)
  doc.text('Conserve este comprobante para sus registros.', 20, 140)
  doc.save(`comprobante-${receipt.code}.pdf`)
}

export function ReceiptPage({ receipt, backTo }: { receipt?: Receipt; backTo: string }) {
  if (!receipt) return <p>Comprobante no encontrado.</p>
  return (
    <div className="receipt-page">
      <div className="receipt-actions">
        <Link to={backTo} className="outline-button">Volver</Link>
        <button className="primary-button" onClick={() => downloadPdf(receipt)}><Download size={17} /> Descargar PDF</button>
      </div>
      <article className="receipt">
        <div className="receipt-brand"><strong>Biblio<span>Uni</span></strong><span>COMPROBANTE DIGITAL</span></div>
        <div className="receipt-title">
          <span>PRÉSTAMO</span>
          <h1>Comprobante de préstamo</h1>
          <p>Biblioteca Central · Universidad</p>
        </div>
        <div className="receipt-code"><small>CÓDIGO DEL PRÉSTAMO</small><strong>{receipt.code}</strong></div>
        <div className="receipt-details">
          <div><small>USUARIO</small><strong>{receipt.userName}</strong><span>{receipt.userCode}</span></div>
          <div><small>LIBRO</small><strong>{receipt.bookTitle}</strong><span>{receipt.bookAuthor}</span></div>
          <div><small>FECHA DE PRÉSTAMO</small><strong>{formatDate(receipt.borrowedAt)}</strong></div>
          <div><small>FECHA LÍMITE DE DEVOLUCIÓN</small><strong>{formatDate(receipt.dueAt)}</strong></div>
        </div>
        <div className="receipt-footer"><CheckCircle size={18} /> Conserve este comprobante para sus registros.</div>
      </article>
    </div>
  )
}
