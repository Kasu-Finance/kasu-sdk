import {
  alpha,
  styled,
  SxProps,
  TableCell,
  TableCellProps,
  TableRow,
  TableSortLabel,
  TableSortLabelProps,
  Theme,
} from '@mui/material'
import React, { ReactNode, useCallback, useMemo } from 'react'

import { Sort } from '@/components/molecules/CustomTable'

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  background: alpha(theme.palette.primary.main, 0.08),
}))

export type CustomTableHeader<T> = {
  label: ReactNode
  value: keyof T
  disableSort?: boolean
}

type TableHeadersProps<U> = {
  headers: CustomTableHeader<U>[]
  sort: Sort<U>
  handleSortChange: (newKey: keyof U) => void
  TableCellComp?: React.ComponentType<TableCellProps>
  SortLabelComp?: React.ComponentType<TableSortLabelProps>
  headersStyle?: SxProps<Theme>
  additionalHeaders?: CustomTableHeader<U>[]
  additionalHeadersStyle?: SxProps<Theme>
}

const TableHeaders = <U,>({
  headers,
  sort,
  handleSortChange,
  TableCellComp = TableCell,
  SortLabelComp = TableSortLabel,
  headersStyle,
  additionalHeaders,
  additionalHeadersStyle,
}: TableHeadersProps<U>) => {
  const renderHeaderCell = useCallback(
    (header: CustomTableHeader<U>, index: number, isActive: boolean) => (
      <TableCellComp
        key={`${String(header.value)}-${index}`}
        sx={{ textAlign: index === 0 ? 'left' : 'right' }}
      >
        {header.disableSort ? (
          header.label
        ) : (
          <SortLabelComp
            active={isActive}
            direction={isActive ? sort.direction : 'desc'}
            onClick={() => handleSortChange(header.value)}
          >
            {header.label}
          </SortLabelComp>
        )}
      </TableCellComp>
    ),
    [sort.direction, handleSortChange, TableCellComp, SortLabelComp]
  )

  const headerRows = useMemo(
    () => ({
      main: (
        <StyledTableRow sx={headersStyle}>
          {headers.map((header, index) =>
            renderHeaderCell(header, index, sort.key === header.value)
          )}
        </StyledTableRow>
      ),
      additional: additionalHeaders && (
        <StyledTableRow sx={additionalHeadersStyle}>
          {additionalHeaders.map((header, index) =>
            renderHeaderCell(header, index, sort.key === header.value)
          )}
        </StyledTableRow>
      ),
    }),
    [
      headers,
      additionalHeaders,
      headersStyle,
      additionalHeadersStyle,
      sort,
      renderHeaderCell,
    ]
  )

  return (
    <>
      {headerRows.main}
      {headerRows.additional}
    </>
  )
}

export default TableHeaders
