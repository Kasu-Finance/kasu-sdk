import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableRow,
} from '@mui/material'
import React, { useState } from 'react'

import { getComparator, Order, stableSort } from '@/utils/table'

import { StyledTableCell, StyledTablePagination } from './styled'
import TableHead, { Data } from './TableHead'

interface RepaymentsTableProps {
  data: Data[]
}

const RepaymentsTable: React.FC<RepaymentsTableProps> = ({ data }) => {
  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<keyof Data>('source')
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby='tableTitle'
            size='medium'
          >
            <TableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(data, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  return (
                    <TableRow hover tabIndex={-1} key={`${row.id}_${index}`}>
                      <StyledTableCell align='left'>
                        {row.source}
                      </StyledTableCell>
                      <StyledTableCell align='left'>
                        {row.repaymentDate}
                      </StyledTableCell>
                      <StyledTableCell align='left'>
                        {row.repaymentAmount}
                      </StyledTableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <StyledTablePagination
          rowsPerPageOptions={[10, 25]}
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) =>
            setRowsPerPage(parseInt(event.target.value, 10))
          }
        />
      </Paper>
    </Box>
  )
}

export default RepaymentsTable
