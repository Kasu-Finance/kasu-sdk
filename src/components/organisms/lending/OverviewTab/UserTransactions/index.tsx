'use client'

import { Typography } from '@mui/material'

import useTransactionHistory from '@/hooks/lending/useTransactionHistory'
import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import TransactionFilters from '@/components/organisms/lending/OverviewTab/UserTransactions/TransactionFilters'
import UserTransactionTable from '@/components/organisms/lending/OverviewTab/UserTransactions/UserTransactionTable.tsx'

import TransactionHistoryState from '@/context/transactionHistory/transactionHistory.provider'

const UserTransactions = () => {
  const { t } = useTranslation()

  const { isLoading, transactionHistory } = useTransactionHistory()

  if (isLoading || !transactionHistory || !transactionHistory.length)
    return null

  return (
    <CustomCard>
      <Typography variant='h3' color='gold.darkNoises' px={2} mb={3}>
        {t('lending.poolOverview.transactionsHistory.title')}
      </Typography>
      <CustomInnerCardContent sx={{ px: 0 }}>
        <TransactionHistoryState>
          <TransactionFilters />
          <UserTransactionTable transactionHistory={transactionHistory} />
        </TransactionHistoryState>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default UserTransactions
