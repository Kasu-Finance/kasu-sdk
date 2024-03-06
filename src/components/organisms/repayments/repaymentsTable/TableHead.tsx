import { TableHead as TableHeadMUI, TableRow } from '@mui/material'
import React from 'react'

import {
  BorderTableCell,
  StyledTableSortLabel,
} from '@/components/organisms/repayments/repaymentsTable/styled'

import { Order } from '@/utils/table'

export interface Data {
  id: string
  source: string
  repaymentDate: string
  repaymentAmount: string
}

export interface HeadCell {
  id: keyof Data
  label: string
  numeric: boolean
}

export interface TableHeadProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void
  order: Order
  orderBy: string
}

const headCells: readonly HeadCell[] = [
  { id: 'source', numeric: false, label: 'Source' },
  { id: 'repaymentDate', numeric: false, label: 'Repayment Date' },
  { id: 'repaymentAmount', numeric: false, label: 'Repayment Amount' },
]

const TableHead: React.FC<TableHeadProps> = (props) => {
  const { order, orderBy, onRequestSort } = props

  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

  return (
    <TableHeadMUI>
      <TableRow>
        {headCells.map((headCell) => (
          <BorderTableCell
            key={headCell.id}
            align='left'
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <StyledTableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </StyledTableSortLabel>
          </BorderTableCell>
        ))}
      </TableRow>
    </TableHeadMUI>
  )
}

export default TableHead
