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
import { ReactNode, useState } from 'react'

import usePagination from '@/hooks/usePagination'
import useTranslation from '@/hooks/useTranslation'

export type CustomTableHeader<U extends readonly any[]> = {
  label: ReactNode
  value: U[number]
  disableSort?: boolean
  styles?: SxProps<Theme>
}

export type Sort<U extends readonly any[]> = {
  key: U[number]
  direction: 'asc' | 'desc'
}

type CustomTableProps<T, U extends readonly any[]> = {
  headers:
    | CustomTableHeader<U>[]
    | ((
        handleSortChange: (newKey: Readonly<U[number]>) => void,
        sort: Sort<U>
      ) => ReactNode)
  sortKeys: U
  data: T[]
  defaultSortKey: U[number]
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
  footerStyle?: SxProps<Theme>
  paginationStyle?: SxProps<Theme>
}

const CustomTable = <T, U extends readonly any[]>({
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
  headersStyle,
  footerStyle,
  paginationStyle,
}: CustomTableProps<T, U>) => {
  const { t } = useTranslation()

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

  const handleSortChange = (newKey: U[number]) => {
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

  const sortedData = data.sort((a, b) => handleSort(a, b, sort))

  return (
    <Box>
      <TableContainer
        sx={[
          { borderBottom: 'none' },
          ...(Array.isArray(tableContainerStyles)
            ? tableContainerStyles
            : [tableContainerStyles]),
        ]}
      >
        <Table
          sx={[
            { borderRadius: 2, overflow: 'hidden' },
            ...(Array.isArray(tableStyles) ? tableStyles : [tableStyles]),
          ]}
          aria-labelledby={ariaLabel}
        >
          <TableHead sx={headersStyle}>
            {typeof headers === 'function' ? (
              headers(handleSortChange, sort)
            ) : (
              <TableRow
                sx={(theme) => ({
                  background: alpha(theme.palette.primary.main, 0.08),
                })}
              >
                {headers.map(({ label, value, disableSort, styles }, index) => {
                  const isActive = sort.key === value

                  return (
                    <TableCell
                      key={index}
                      sx={[
                        {
                          textAlign: index === 0 ? 'left' : 'right',
                        },
                        ...(Array.isArray(styles) ? styles : [styles]),
                      ]}
                    >
                      {disableSort ? (
                        label
                      ) : (
                        <TableSortLabel
                          active={isActive}
                          direction={isActive ? sort.direction : 'desc'}
                          onClick={() => handleSortChange(value)}
                        >
                          {label}
                        </TableSortLabel>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {children(pagination ? paginateData(sortedData) : sortedData)}
            {emptyRows > 0 && (
              <TableRow style={{ height: 135 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          {footer && (
            <TableFooter
              sx={[
                (theme) => ({
                  borderTop: '1px solid rgba(224, 224, 224, 1)',
                  '& .MuiTableCell-root': {
                    color: theme.palette.text.primary,
                  },
                }),
                ...(Array.isArray(footerStyle) ? footerStyle : [footerStyle]),
              ]}
            >
              {footer}
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
          labelRowsPerPage={t('general.rowsPerPage')}
          size='small'
          sx={[
            (theme) => ({
              '.MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel':
                {
                  fontSize: 'inherit',
                },

              [theme.breakpoints.down('sm')]: {
                '.MuiTablePagination-spacer': {
                  display: 'none',
                },
                '.MuiTablePagination-toolbar': {
                  pl: 0,
                },
                '.MuiTablePagination-actions': {
                  ml: 'auto',
                  '.MuiSvgIcon-root': {
                    width: 16,
                    height: 16,
                  },
                },
              },
            }),
            ...(Array.isArray(paginationStyle)
              ? paginationStyle
              : [paginationStyle]),
          ]}
        />
      )}
    </Box>
  )
}

export default CustomTable
