import { Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import PortfolioUserTransactionTableWrapper from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/PortfolioUserTransactionTableWrapper'

import TransactionHistoryState from '@/context/transactionHistory/transactionHistory.provider'

const YourTransactions = () => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <Typography variant='h3' color='gold.darkNoises' px={2} mb={3}>
        {t('lending.poolOverview.transactionsHistory.title')}
      </Typography>
      <CustomInnerCardContent sx={{ px: 0 }}>
        <TransactionHistoryState withPoolIdFilter>
          <PortfolioUserTransactionTableWrapper />
        </TransactionHistoryState>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default YourTransactions
