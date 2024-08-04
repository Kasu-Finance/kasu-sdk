import { alpha, TableCell, TableRow, Typography } from '@mui/material'
import React from 'react'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'

import { Sort } from '@/components/molecules/CustomTable'
import CustomTableSortLabel from '@/components/molecules/CustomTable/CustomTableSortLabel'
import { TRANSACTION_HISTORY_KEYS } from '@/components/molecules/lending/overview/TransactionHistory'

type TransactionHistoryTableHeaderProps = {
  handleSortChange: (newKey: (typeof TRANSACTION_HISTORY_KEYS)[number]) => void
  sort: Sort<typeof TRANSACTION_HISTORY_KEYS>
}

const TransactionHistoryTableHeader: React.FC<
  TransactionHistoryTableHeaderProps
> = ({ handleSortChange, sort }) => {
  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

  return (
    <>
      <TableRow
        sx={(theme) => ({
          background: alpha(theme.palette.primary.main, 0.04),
        })}
      >
        <TableCell
          rowSpan={2}
          width={isMobile ? '23%' : '18%'}
          className='request-type'
        >
          <CustomTableSortLabel
            label='Request'
            sortKey='requestType'
            sort={sort}
            handleSortChange={handleSortChange}
            disableSort={isMobile}
          />
        </TableCell>
        {!isMobile && (
          <TableCell rowSpan={2} width='12%' align='right'>
            <CustomTableSortLabel
              label='Tranche'
              sortKey='trancheName'
              sort={sort}
              handleSortChange={handleSortChange}
              flipIcon
              disableSort={isMobile}
            />
          </TableCell>
        )}

        {!isMobile && (
          <TableCell align='center' colSpan={3} width='30%'>
            <Typography variant='subtitle2' sx={{ fontWeight: '500' }}>
              Total Amounts
            </Typography>
          </TableCell>
        )}
        {isMobile && (
          <TableCell width='32%'>
            <Typography variant='subtitle2' sx={{ fontWeight: '500' }}>
              Accepted Amount
            </Typography>
          </TableCell>
        )}
        <TableCell
          rowSpan={2}
          width={isMobile ? '25%' : '14%'}
          align={isMobile ? 'left' : 'right'}
        >
          <CustomTableSortLabel
            label='Request Date'
            sortKey='timestamp'
            sort={sort}
            handleSortChange={handleSortChange}
            disableSort={isMobile}
          />
        </TableCell>
        <TableCell
          rowSpan={2}
          width={isMobile ? '20%' : '14%'}
          align={isMobile ? 'left' : 'center'}
        >
          <CustomTableSortLabel
            label='Status'
            sortKey='status'
            sort={sort}
            handleSortChange={handleSortChange}
            disableSort={isMobile}
          />
        </TableCell>
      </TableRow>
      <TableRow
        sx={(theme) => ({
          background: alpha(theme.palette.primary.main, 0.04),
        })}
      >
        {!isMobile && (
          <>
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
          </>
        )}
      </TableRow>
    </>
  )
}

export default TransactionHistoryTableHeader
