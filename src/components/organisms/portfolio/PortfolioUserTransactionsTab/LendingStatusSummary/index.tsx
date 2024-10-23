import { Stack } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import LendingRequests from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/LendingRequests'
import SubsequentTransactions from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/SubsequentTransactions'

const LendingStatusSummary = () => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <CustomCardHeader
        title={t('portfolio.transactions.lendingStatusSummary.title')}
      />
      <CustomInnerCardContent>
        <Stack spacing={6}>
          <LendingRequests />
          <SubsequentTransactions />
        </Stack>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default LendingStatusSummary
