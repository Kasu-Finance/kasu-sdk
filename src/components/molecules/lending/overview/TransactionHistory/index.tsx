import FilterIcon from '@mui/icons-material/FilterAlt'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material'
import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { useCallback, useReducer, useState } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useTransactionHistoryState from '@/hooks/context/useTransactionHistoryState'
import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import ToolTip from '@/components/atoms/ToolTip'
import CustomTable, { Sort } from '@/components/molecules/CustomTable'
import TransactionHistoryFilters from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryFilters'
import TransactionHistoryTableHeader from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryTableHeader'
import TransactionHistoryTableRow from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryTableRow'

import { ModalsKeys } from '@/context/modal/modal.types'

import { toBigNumber } from '@/utils'

const handleSort = (
  a: UserRequest,
  b: UserRequest,
  sort: Sort<typeof TRANSACTION_HISTORY_KEYS>
) => {
  const direction = sort.direction === 'asc' ? 1 : -1

  if (
    sort.key === 'status' ||
    sort.key === 'requestType' ||
    sort.key === 'trancheName'
  ) {
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
  'trancheName',
] as const

const TransactionHistory: React.FC<{ poolId: string }> = ({ poolId }) => {
  const [open, setOpen] = useState<number | undefined>(undefined)

  const { openModal } = useModalState()

  const { transactionHistory, isLoading } = useTransactionHistory()
  const { status, trancheType, transactionType } = useTransactionHistoryState()
  const { t } = useTranslation()

  const [collasped, toggleCollapsed] = useReducer((prev) => !prev, false)

  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

  const handleOpen = useCallback(
    (transactionHistory: UserRequest) => {
      openModal({
        name: ModalsKeys.TRANSACTION_HISTORY_CONTENT,
        transactionHistory,
      })
    },
    [openModal]
  )

  const handleCollapse = useCallback((index: number) => {
    setOpen((prev) => (prev === index ? undefined : index))
  }, [])

  if (isLoading || !transactionHistory?.length) return null

  const filteredData: UserRequest[] = transactionHistory.filter(
    (transaction) => {
      return (
        transaction.lendingPool.id === poolId &&
        (status === 'All' || transaction.status === status) &&
        (trancheType === 'All Tranches' ||
          transaction.trancheName === trancheType) &&
        (transactionType === 'All Transactions' ||
          transaction.requestType === transactionType)
      )
    }
  )

  return (
    <Card
      sx={(theme) => ({
        [theme.breakpoints.down('sm')]: {
          mt: 2,
        },
      })}
    >
      <CardHeader
        title={
          <Box display='flex' alignItems='center'>
            <Typography variant='h6' component='h6' m={0}>
              {t('lending.poolOverview.transactionsHistory.title')}
            </Typography>
            <ToolTip
              sx={{ mt: 0.5 }}
              title={t('lending.poolOverview.transactionsHistory.tooltip')}
            />
          </Box>
        }
        titleTypographyProps={{
          variant: 'h6',
          component: 'h6',
          m: 0,
        }}
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            height: 42,
          },
        })}
        action={
          isMobile && (
            <IconButton
              sx={{
                p: 0,
                '.MuiSvgIcon-root': {
                  mt: '-7px',
                  fill: collasped ? '#AD8A60' : 'background.default',
                },
              }}
              onClick={toggleCollapsed}
            >
              <FilterIcon />
            </IconButton>
          )
        }
      />
      <CardContent sx={{ p: isMobile ? 1 : undefined }}>
        <Collapse in={!isMobile || collasped}>
          <TransactionHistoryFilters />
        </Collapse>
        <CustomTable
          tableContainerStyles={{ mt: 2 }}
          data={filteredData}
          sortKeys={TRANSACTION_HISTORY_KEYS}
          defaultSortKey='timestamp'
          handleSort={handleSort}
          headersStyle={(theme) => ({
            '& .MuiTableCell-root': {
              py: '6px',
              px: 2,

              [theme.breakpoints.down('sm')]: {
                px: 0,
                pt: 0,
                pb: 2,

                '& .MuiTypography-root': {
                  fontSize: 10,
                },
              },

              '&.request-type': {
                pl: isMobile ? 0 : 8,
              },
            },
          })}
          paginationStyle={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              fontSize: 10,
            },
          })}
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
                    isMobile ? handleOpen(transaction) : handleCollapse(index)
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
