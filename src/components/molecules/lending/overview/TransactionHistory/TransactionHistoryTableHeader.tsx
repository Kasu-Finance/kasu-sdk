import { alpha, TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import { Sort } from '@/components/molecules/CustomTable'
import CustomTableSortLabel from '@/components/molecules/CustomTable/CustomTableSortLabel'
import { TRANSACTION_HISTORY_KEYS } from '@/components/molecules/lending/overview/TransactionHistory'

type TransactionHistoryTableHeaderProps = {
  handleSortChange: (newKey: (typeof TRANSACTION_HISTORY_KEYS)[number]) => void
  sort: Sort<typeof TRANSACTION_HISTORY_KEYS>
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
      <TableCell rowSpan={2} width='18%' className='request-type'>
        <CustomTableSortLabel
          label='Request'
          sortKey='requestType'
          sort={sort}
          handleSortChange={handleSortChange}
        />
      </TableCell>
      <TableCell rowSpan={2} width='12%' align='right'>
        <CustomTableSortLabel
          label='Tranche'
          sortKey='trancheName'
          sort={sort}
          handleSortChange={handleSortChange}
          flipIcon
        />
      </TableCell>

      <TableCell align='center' colSpan={3} width='30%'>
        <Typography variant='subtitle2' sx={{ fontWeight: '500' }}>
          Total Amounts
        </Typography>
      </TableCell>
      <TableCell rowSpan={2} width='14%' align='right'>
        <CustomTableSortLabel
          label='Request Date'
          sortKey='timestamp'
          sort={sort}
          handleSortChange={handleSortChange}
        />
      </TableCell>
      <TableCell rowSpan={2} width='14%' align='center'>
        <CustomTableSortLabel
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
        <CustomTableSortLabel
          label='Requested'
          sortKey='requestedAmount'
          sort={sort}
          handleSortChange={handleSortChange}
        />
      </TableCell>
      <TableCell align='right' width='18%'>
        <CustomTableSortLabel
          label='Accepted'
          sortKey='acceptedAmount'
          sort={sort}
          handleSortChange={handleSortChange}
        />
      </TableCell>
      <TableCell align='right' width='18%'>
        <CustomTableSortLabel
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
