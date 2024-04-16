import { Box, Card, CardContent, CardHeader } from '@mui/material'
import { ethers } from 'ethers'
import { useState } from 'react'

import ToolTip from '@/components/atoms/ToolTip'
import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import TransactionHistoryFilters from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryFilters'
import TransactionHistoryTableFooter from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryTableFooter'
import TransactionHistoryTableHeader from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryTableHeader'
import TransactionHistoryTableRow from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryTableRow'

import { toBigNumber } from '@/utils'

export type ActionHistory = {
  id: string
  actionType: 'Initiated' | 'Accepted' | 'Rejected'
  requestedAmount: string
  acceptedAmount: string
  rejectedAmount: string
  requestDate: EpochTimeStamp
  txHash: string
}

export type TransactionHistoryType = {
  id: string
  requestType: 'Deposit' | 'Withdrawal'
  requestedAmount: string
  acceptedAmount: string
  rejectedAmount: string
  requestDate: EpochTimeStamp
  status: 'Processing' | 'Processed' | 'Requested'
  actionHistory: ActionHistory[]
}

const DATA: TransactionHistoryType[] = [
  {
    id: ethers.constants.AddressZero,
    requestType: 'Deposit',
    requestedAmount: '1000.00',
    acceptedAmount: '0',
    rejectedAmount: '1000.00',
    requestDate: 1713008042,
    status: 'Processed',
    actionHistory: [
      {
        txHash: '0x1',
        id: ethers.constants.AddressZero,
        requestedAmount: '1000.00',
        acceptedAmount: '0',
        rejectedAmount: '1000.00',
        requestDate: 1713008042,
        actionType: 'Initiated',
      },
    ],
  },
  {
    id: '0x0000000000000000000000000000000000000001',
    requestType: 'Withdrawal',
    requestedAmount: '500.00',
    acceptedAmount: '400',
    rejectedAmount: '100.00',
    requestDate: 1713018042,
    status: 'Processing',
    actionHistory: [
      {
        txHash: '0x1',
        id: ethers.constants.AddressZero,
        requestedAmount: '1000.00',
        acceptedAmount: '0',
        rejectedAmount: '1000.00',
        requestDate: 1713008042,
        actionType: 'Initiated',
      },
    ],
  },
]

const handleSort = (
  a: TransactionHistoryType,
  b: TransactionHistoryType,
  sort: Sort<TransactionHistoryType>
) => {
  if (sort.key === 'id' || sort.key === 'actionHistory') return 0

  const direction = sort.direction === 'asc' ? 1 : -1

  if (sort.key === 'status' || sort.key === 'requestType') {
    return a[sort.key].localeCompare(b[sort.key]) * direction
  }

  let aValue: number
  let bValue: number

  if (
    sort.key === 'acceptedAmount' ||
    sort.key === 'requestedAmount' ||
    sort.key === 'rejectedAmount'
  ) {
    aValue = toBigNumber(a[sort.key].toString())
      .div(toBigNumber('1'))
      .toNumber()
    bValue = toBigNumber(b[sort.key].toString())
      .div(toBigNumber('1'))
      .toNumber()
  } else {
    aValue = a[sort.key]
    bValue = b[sort.key]
  }

  return (aValue - bValue) * direction
}

const TransactionHistory = () => {
  const [open, setOpen] = useState<number | undefined>(undefined)

  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader
        title={
          <Box display='flex' alignItems='center'>
            Your Transactions
            <ToolTip sx={{ display: 'inline-block' }} title='tooltip' />
          </Box>
        }
        titleTypographyProps={{
          variant: 'h6',
          component: 'h6',
          m: 0,
        }}
      />
      <CardContent>
        <TransactionHistoryFilters />
        <CustomTable
          tableContainerStyles={{ mt: 2 }}
          data={DATA}
          defaultSortKey='requestType'
          handleSort={handleSort}
          headersStyle={{
            '& .MuiTableCell-root': {
              py: '6px',
              px: 2,
            },
          }}
          footer={<TransactionHistoryTableFooter />}
          headers={(handleSortChange, sort) => (
            <TransactionHistoryTableHeader
              handleSortChange={handleSortChange}
              sort={sort}
            />
          )}
        >
          {(data) =>
            data.map((transaction, index) => {
              const isActive = open === index

              return (
                <TransactionHistoryTableRow
                  handleCollapse={() =>
                    setOpen((prev) => (prev === index ? undefined : index))
                  }
                  isActive={isActive}
                  transaction={transaction}
                  key={index}
                />
              )
            })
          }
        </CustomTable>
      </CardContent>
    </Card>
  )
}

export default TransactionHistory
