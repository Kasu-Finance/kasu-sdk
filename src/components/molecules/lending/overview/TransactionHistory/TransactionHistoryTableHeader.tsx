import { alpha, TableCell, TableRow } from '@mui/material'
import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'
import React from 'react'

import { Sort } from '@/components/molecules/CustomTable'
import TransactionSortLabel from '@/components/molecules/lending/overview/TransactionHistory/TransactionSortLabel'

type TransactionHistoryTableHeaderProps = {
  handleSortChange: (newKey: keyof UserRequest) => void
  sort: Sort<UserRequest>
}

const TransactionHistoryTableHeader: React.FC<
  TransactionHistoryTableHeaderProps
> = ({ handleSortChange, sort }) => (
  <>
    <TableRow
      sx={(theme) => ({
        background: alpha(theme.palette.primary.main, 0.04),
      })}
    >
      <TableCell rowSpan={2} width='18%' sx={{ pl: 8 }}>
        <TransactionSortLabel
          label='Request'
          sortKey='requestType'
          sort={sort}
          handleSortChange={handleSortChange}
        />
      </TableCell>
      <TableCell align='center' width='54%' colSpan={3}>
        Total Amounts
      </TableCell>
      <TableCell rowSpan={2} width='14%' align='right'>
        <TransactionSortLabel
          label='Request Date'
          sortKey='timestamp'
          sort={sort}
          handleSortChange={handleSortChange}
        />
      </TableCell>
      <TableCell rowSpan={2} width='14%' align='center'>
        <TransactionSortLabel
          label='Status'
          sortKey='status'
          sort={sort}
          handleSortChange={handleSortChange}
        />
      </TableCell>
    </TableRow>
    <TableRow
      sx={(theme) => ({
        background: alpha(theme.palette.primary.main, 0.04),
      })}
    >
      <TableCell align='right' width='18%'>
        <TransactionSortLabel
          label='Requested'
          sortKey='requestedAmount'
          sort={sort}
          handleSortChange={handleSortChange}
        />
      </TableCell>
      <TableCell align='right' width='18%'>
        <TransactionSortLabel
          label='Accepted'
          sortKey='acceptedAmount'
          sort={sort}
          handleSortChange={handleSortChange}
        />
      </TableCell>
      <TableCell align='right' width='18%'>
        <TransactionSortLabel
          label='Rejected'
          sortKey='rejectedAmount'
          sort={sort}
          handleSortChange={handleSortChange}
        />
      </TableCell>
    </TableRow>
  </>
)

export default TransactionHistoryTableHeader
