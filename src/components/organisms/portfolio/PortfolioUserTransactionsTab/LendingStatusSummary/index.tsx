import { Stack } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import LendingRequests from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/LendingRequests'
import LendingStatusSummarySkeleton from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/LendingStatusSummarySkeleton'
import SubsequentTransactions from '@/components/organisms/portfolio/PortfolioUserTransactionsTab/LendingStatusSummary/SubsequentTransactions'

import { getCurrentEpoch } from '@/app/_requests/currentEpoch'

const LendingStatusSummary = async () => {
  const { t } = getTranslation()

  const currentEpoch = await getCurrentEpoch()

  return (
    <CustomCard>
      <CustomCardHeader
        title={t('portfolio.transactions.lendingStatusSummary.title')}
      />
      <CustomInnerCardContent>
        {currentEpoch ? (
          <Stack spacing={6}>
            <LendingRequests currentEpoch={currentEpoch} />
            <SubsequentTransactions currentEpoch={currentEpoch} />
          </Stack>
        ) : (
          <LendingStatusSummarySkeleton />
        )}
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default LendingStatusSummary
