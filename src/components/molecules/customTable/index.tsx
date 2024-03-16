import {
  alpha,
  Box,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TablePaginationProps,
  TableRow,
  TableSortLabel,
  TableSortLabelProps,
  Theme,
} from '@mui/material'
import React, { ComponentType, ReactNode, useState } from 'react'

import usePagination from '@/hooks/usePagination'

import TableHeaders, {
  CustomTableHeader,
} from '@/components/molecules/customTable/TableHeaders'

export type Sort<T> = {
  key: keyof T
  direction: 'asc' | 'desc'
}

type CustomTableProps<T, U> = {
  headers: CustomTableHeader<U>[]
  data: T[]
  defaultSortKey: keyof U
  handleSort: (a: T, b: T, sort: Sort<U>) => number
  children: (data: T[]) => ReactNode
  pagination?: boolean
  ariaLabel?: string
  footer?: ReactNode
  rowPerPage?: number
  rowPerPageOptions?: number[]
  tableContainerStyles?: SxProps<Theme>
  tableStyles?: SxProps<Theme>
  headersStyle?: SxProps<Theme>
  additionalHeaders?: CustomTableHeader<U>[]
  additionalHeadersStyle?: SxProps<Theme>
  TableCellComp?: ComponentType<TableCellProps>
  SortLabelComp?: ComponentType<TableSortLabelProps>
  PaginationComp?: ComponentType<TablePaginationProps>
}

const CustomTable = <T, U>({
  ariaLabel = 'Table',
  headers,
  additionalHeaders,
  data,
  defaultSortKey,
  handleSort,
  children,
  footer,
  pagination = true,
  rowPerPage = 5,
  rowPerPageOptions = [5, 10, 25],
  tableContainerStyles,
  tableStyles,
  headersStyle,
  additionalHeadersStyle,
  TableCellComp = TableCell,
  SortLabelComp = TableSortLabel,
  PaginationComp = TablePagination,
}: CustomTableProps<T, U>) => {
  const [sort, setSort] = useState<Sort<U>>({
    key: defaultSortKey,
    direction: 'desc',
  })

  const [rowsPerPage, setRowsPerPage] = useState(rowPerPage)

  const { currentPage, setPage, paginateData } = usePagination(
    rowsPerPage,
    data.length
  )

  const emptyRows =
    currentPage > 0
      ? Math.max(0, (1 + currentPage) * rowsPerPage - data.length)
      : 0

  const handleSortChange = (newKey: keyof U) => {
    setSort((prev) => ({
      key: newKey,
      direction:
        prev.key === newKey && prev.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  const handlePageChange = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Box>
      <TableContainer sx={{ borderBottom: 'none', ...tableContainerStyles }}>
        <Table
          sx={{ borderRadius: 2, overflow: 'hidden', ...tableStyles }}
          aria-labelledby={ariaLabel}
        >
          <TableHead>
            <TableHeaders
              headers={headers}
              sort={sort}
              handleSortChange={handleSortChange}
              TableCellComp={TableCellComp}
              SortLabelComp={SortLabelComp}
              additionalHeaders={additionalHeaders}
              headersStyle={headersStyle}
              additionalHeadersStyle={additionalHeadersStyle}
            />
          </TableHead>
          <TableBody>
            {children(
              paginateData(data.sort((a, b) => handleSort(a, b, sort)))
            )}
            {emptyRows > 0 && (
              <TableRow style={{ height: 135 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          {footer && (
            <TableFooter sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableRow
                sx={(theme) => ({
                  background: alpha(theme.palette.primary.main, 0.08),
                })}
              >
                <TableCell padding='none' colSpan={headers.length}>
                  {footer}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
      {pagination && (
        <PaginationComp
          rowsPerPageOptions={rowPerPageOptions}
          component='div'
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={currentPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </Box>
  )
}

export default CustomTable
