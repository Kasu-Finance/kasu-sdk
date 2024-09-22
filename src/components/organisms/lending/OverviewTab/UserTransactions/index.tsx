'use client'

import React from 'react'

import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import TransactionFilters from '@/components/organisms/lending/OverviewTab/UserTransactions/TransactionFilters'
import UserTransactionTable from '@/components/organisms/lending/OverviewTab/UserTransactions/UserTransactionTable.tsx'

import TransactionHistoryState from '@/context/transactionHistory/transactionHistory.provider'

type UserTransactionsProps = {
  poolId: string
}

const UserTransactions: React.FC<UserTransactionsProps> = ({ poolId }) => {
  const { t } = useTranslation()

  const { isLoading, transactionHistory } = useTransactionHistory()

  if (isLoading || !transactionHistory || !transactionHistory.length)
    return null

  const filteredTransactions = transactionHistory.filter(
    (transaction) => poolId === transaction.lendingPool.id
  )

  return (
    <CustomCard>
      <CustomCardHeader
        title={t('lending.poolOverview.transactionsHistory.title')}
      />
      <CustomInnerCardContent sx={{ px: 0 }}>
        <TransactionHistoryState>
          <TransactionFilters />
          <UserTransactionTable transactionHistory={filteredTransactions} />
        </TransactionHistoryState>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default UserTransactions
