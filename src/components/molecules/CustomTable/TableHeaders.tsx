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
  Typography,
  TypographyProps,
} from '@mui/material'
import React, { ReactNode, useCallback, useMemo } from 'react'

import { Sort } from '@/components/molecules/CustomTable'

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  background: alpha(theme.palette.primary.main, 0.05),
}))

type LabelPart = {
  text: string
  props?: TypographyProps
}

export type CustomTableHeader<T> = {
  label: ReactNode
  value: keyof T
  disableSort?: boolean
  extraLabel?: LabelPart
}

type TableHeadersProps<U> = {
  headers: CustomTableHeader<U>[]
  sort: Sort<U>
  handleSortChange: (newKey: keyof U) => void
  tableCellComp?: React.ComponentType<TableCellProps>
  sortLabelComp?: React.ComponentType<TableSortLabelProps>
  headersStyle?: SxProps<Theme>
  additionalHeaders?: CustomTableHeader<U>[]
  additionalHeadersStyle?: SxProps<Theme>
}

const TableHeaders = <U,>({
  headers,
  sort,
  handleSortChange,
  tableCellComp = TableCell,
  sortLabelComp = TableSortLabel,
  headersStyle,
  additionalHeaders,
  additionalHeadersStyle,
}: TableHeadersProps<U>) => {
  const TableCellComp = tableCellComp
  const SortLabelComp = sortLabelComp

  const renderHeaderCell = useCallback(
    (header: CustomTableHeader<U>, index: number, isActive: boolean) => (
      <TableCellComp
        key={`${String(header.value)}-${index}`}
        sx={{ textAlign: index === 0 ? 'left' : 'right' }}
      >
        {header.disableSort ? (
          <>
            <span>{header.label}</span>
            {header.extraLabel && (
              <Typography {...header.extraLabel.props}>
                {header.extraLabel.text}
              </Typography>
            )}
          </>
        ) : (
          <SortLabelComp
            active={isActive}
            direction={isActive ? sort.direction : 'desc'}
            onClick={() => handleSortChange(header.value)}
          >
            <>
              <span>{header.label}</span>
              {header.extraLabel && (
                <Typography {...header.extraLabel.props}>
                  {header.extraLabel.text}
                </Typography>
              )}
            </>
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
