type CsvCell = string | number | boolean | null | undefined

type CreateCsvParams = {
  headers: string[]
  rows: CsvCell[][]
  delimiter?: ',' | ';' | '\t'
  includeBom?: boolean
}

const escapeCsvCell = (value: CsvCell, delimiter: string): string => {
  const stringValue = value === null || value === undefined ? '' : String(value)

  const normalized = stringValue.replaceAll('\r\n', '\n').replaceAll('\r', '\n')

  const shouldQuote =
    normalized.includes('"') ||
    normalized.includes('\n') ||
    normalized.includes(delimiter)

  if (!shouldQuote) return normalized

  return `"${normalized.replaceAll('"', '""')}"`
}

export const createCsv = ({
  headers,
  rows,
  delimiter = ',',
  includeBom = true,
}: CreateCsvParams): string => {
  const line = (cells: CsvCell[]) =>
    cells.map((cell) => escapeCsvCell(cell, delimiter)).join(delimiter)

  const csv = [line(headers), ...rows.map(line)].join('\r\n')

  return includeBom ? `\uFEFF${csv}` : csv
}
