const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

/** Lee la primera hoja de un .xlsx y devuelve todas las filas como texto. */
export async function readSheet(file: File): Promise<string[][]> {
  const ExcelJS = (await import('exceljs')).default
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())
  const sheet = workbook.worksheets[0]
  if (!sheet) return []
  const columns = sheet.columnCount
  const rows: string[][] = []
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const cells: string[] = []
    for (let index = 1; index <= columns; index += 1) cells.push((row.getCell(index).text ?? '').toString().trim())
    rows.push(cells)
  })
  return rows
}

/** Genera y descarga un archivo .xlsx con encabezados estilizados. */
export async function downloadXlsx(fileName: string, sheetName: string, headers: string[], rows: (string | number)[][]) {
  const ExcelJS = (await import('exceljs')).default
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetName)
  sheet.addRow(headers)
  rows.forEach((row) => sheet.addRow(row))
  const header = sheet.getRow(1)
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6636BE' } }
  sheet.columns.forEach((column, index) => {
    const longest = Math.max(headers[index]?.length ?? 10, ...rows.map((row) => String(row[index] ?? '').length))
    column.width = Math.min(Math.max(longest + 3, 12), 48)
    column.numFmt = '@'
  })
  const buffer = await workbook.xlsx.writeBuffer()
  saveBlob(new Blob([buffer], { type: XLSX_MIME }), fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`)
}
