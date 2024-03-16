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
import React, { ReactNode } from 'react'

import { Sort } from '@/components/molecules/customTable'

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
  const renderHeaderCell = (
    header: CustomTableHeader<U>,
    index: number,
    isActive: boolean
  ) => (
    <TableCellComp
      key={index}
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
  )

  const renderHeaderRow = (
    headersData: CustomTableHeader<U>[],
    style?: SxProps<Theme>
  ) => (
    <StyledTableRow sx={style}>
      {headersData.map((header, index) =>
        renderHeaderCell(header, index, sort.key === header.value)
      )}
    </StyledTableRow>
  )

  return (
    <>
      {renderHeaderRow(headers, headersStyle)}
      {additionalHeaders &&
        renderHeaderRow(additionalHeaders, additionalHeadersStyle)}
    </>
  )
}

export default TableHeaders
