'use client'

import React from 'react'

import useLoanTickets from '@/hooks/lending/useLoanTickets'
import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import LendingRequestsTransactionsTable from '@/components/organisms/lending/OverviewTab/LendingRequestTransactions/LendingRequestsTransactionsTable'
import TransactionFilters from '@/components/organisms/lending/OverviewTab/LendingRequestTransactions/TransactionFilters'

import TransactionHistoryState from '@/context/transactionHistory/transactionHistory.provider'

import { getDetailedTransactions } from '@/utils'

type LendingRequestTransactionsProps = {
  poolId: string
  currentEpoch: string
}

const LendingRequestionTransactions: React.FC<
  LendingRequestTransactionsProps
> = ({ poolId, currentEpoch }) => {
  const { t } = getTranslation()

  const { isLoading, transactionHistory } = useTransactionHistory(currentEpoch)

  const { loanTickets, isLoading: loanTicketsLoading } = useLoanTickets()

  if (isLoading || !transactionHistory || !loanTickets || loanTicketsLoading)
    return null

  const filteredTransactions = transactionHistory.filter(
    (transaction) => poolId === transaction.lendingPool.id
  )

  const detailedTransactions = getDetailedTransactions(
    filteredTransactions,
    loanTickets
  )

  return (
    <CustomCard>
      <CustomCardHeader
        title={t('lending.poolOverview.transactionsHistory.depositTitle')}
      />
      <CustomInnerCardContent sx={{ px: 0 }}>
        <TransactionHistoryState>
          <TransactionFilters />
          <LendingRequestsTransactionsTable
            currentEpoch={currentEpoch}
            transactionHistory={detailedTransactions}
          />
        </TransactionHistoryState>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default LendingRequestionTransactions
