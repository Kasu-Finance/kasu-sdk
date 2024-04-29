import { Box, Card, CardContent, CardHeader } from '@mui/material'
import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { useState } from 'react'

import useTransactionHistoryState from '@/hooks/context/useTransactionHistoryState'
import useTransactionHistory from '@/hooks/lending/useTransactionHistory'

import ToolTip from '@/components/atoms/ToolTip'
import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import TransactionHistoryFilters from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryFilters'
import TransactionHistoryTableFooter from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryTableFooter'
import TransactionHistoryTableHeader from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryTableHeader'
import TransactionHistoryTableRow from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryTableRow'

import { toBigNumber } from '@/utils'

const handleSort = (
  a: UserRequest,
  b: UserRequest,
  sort: Sort<typeof TRANSACTION_HISTORY_KEYS>
) => {
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

export const TRANSACTION_HISTORY_KEYS = [
  'status',
  'requestType',
  'acceptedAmount',
  'requestedAmount',
  'rejectedAmount',
  'timestamp',
] as const

const TransactionHistory = () => {
  const [open, setOpen] = useState<number | undefined>(undefined)

  const { transactionHistory, isLoading } = useTransactionHistory()

  const { status, trancheType, transactionType } = useTransactionHistoryState()

  if (isLoading || !transactionHistory?.length) return null

  const filteredData = transactionHistory
    .filter((transaction) => {
      if (status === 'All') return true

      return transaction.status === status
    })
    .filter((transaction) => {
      if (trancheType === 'All Tranches') return true

      return transaction.trancheName === trancheType
    })
    .filter((transaction) => {
      if (transactionType === 'All Transactions') return true

      return transaction.requestType === transactionType
    })

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
          data={filteredData}
          sortKeys={TRANSACTION_HISTORY_KEYS}
          defaultSortKey='requestType'
          handleSort={handleSort}
          headersStyle={{
            '& .MuiTableCell-root': {
              py: '6px',
              px: 2,
            },
          }}
          footer={
            <TransactionHistoryTableFooter
              transactionHistory={transactionHistory}
            />
          }
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
