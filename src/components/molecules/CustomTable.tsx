import {
  alpha,
  Box,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Theme,
} from '@mui/material'
import React, { ReactNode, useState } from 'react'

import usePagination from '@/hooks/usePagination'

export type CustomTableHeader<T> = {
  label: ReactNode
  value: keyof T
}

export type Sort<T> = {
  key: keyof T
  direction: 'asc' | 'desc'
}

type CustomTableProps<T> = {
  headers: CustomTableHeader<T>[]
  data: T[]
  defaultSortKey: keyof T
  handleSort: (a: T, b: T, sort: Sort<T>) => number
  children: (data: T[]) => ReactNode
  pagination?: boolean
  ariaLabel?: string
  footer?: ReactNode
  rowPerPage?: number
  rowPerPageOptions?: number[]
  tableContainerStyles?: SxProps<Theme>
  tableStyles?: SxProps<Theme>
}

const CustomTable = <T,>({
  ariaLabel = 'Table',
  headers,
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
}: CustomTableProps<T>) => {
  const [sort, setSort] = useState<Sort<T>>({
    key: defaultSortKey,
    direction: 'desc',
  })

  const [rowsPerPage, setRowsPerpage] = useState(rowPerPage)

  const { currentPage, setPage, paginateData } = usePagination(
    rowsPerPage,
    data.length
  )

  const emptyRows =
    currentPage > 0
      ? Math.max(0, (1 + currentPage) * rowsPerPage - data.length)
      : 0

  const handleSortChange = (newKey: keyof T) => {
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
    setRowsPerpage(parseInt(event.target.value, 10))
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
            <TableRow
              sx={(theme) => ({
                background: alpha(theme.palette.primary.main, 0.08),
              })}
            >
              {headers.map(({ label, value }, index) => {
                const isActive = sort.key === value

                return (
                  <TableCell
                    key={value.toString()}
                    sx={{
                      textAlign: index === 0 ? 'left' : 'right',
                    }}
                  >
                    <TableSortLabel
                      active={isActive}
                      direction={isActive ? sort.direction : 'desc'}
                      onClick={() => handleSortChange(value)}
                    >
                      {label}
                    </TableSortLabel>
                  </TableCell>
                )
              })}
            </TableRow>
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
        <TablePagination
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
