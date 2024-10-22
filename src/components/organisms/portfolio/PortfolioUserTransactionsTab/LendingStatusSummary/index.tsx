import { Grid } from '@mui/material'

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
        <Grid container columnSpacing={4} mt={3}>
          <Grid item xs={6}>
            <LendingRequests />
          </Grid>
          <Grid item xs={6}>
            <SubsequentTransactions />
          </Grid>
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default LendingStatusSummary
