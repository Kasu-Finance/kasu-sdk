import { Divider, Grid, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import CustomCardHeader from '@/components/atoms/CustomCard/CustomCardHeader'
import CustomInnerCardContent from '@/components/atoms/CustomCard/CustomInnerCardContent'
import InfoRow from '@/components/atoms/InfoRow'

import { formatAmount } from '@/utils'

const WithdrawalStatusSummary = () => {
  const { t } = useTranslation()

  return (
    <CustomCard>
      <CustomCardHeader
        title={t('portfolio.transactions.withdrawalStatusSummary.title')}
      />
      <CustomInnerCardContent>
        <Grid container columnSpacing={4} mt={3}>
          <Grid item xs={6}>
            <Typography variant='h5'>
              {t(
                'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.title'
              )}
            </Typography>
            <Divider sx={{ mt: 1.5 }} />
          </Grid>
          <Grid item xs={6} display='flex' flexDirection='column'>
            <Divider sx={{ mt: 'auto' }} />
          </Grid>
          <Grid item xs={6}>
            <InfoRow
              title={t(
                'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-1'
              )}
              toolTipInfo={t(
                'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-1-tooltip'
              )}
              showDivider
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(100, { minDecimals: 2 })} USDC
                </Typography>
              }
            />
            <InfoRow
              title={t(
                'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-3'
              )}
              toolTipInfo={t(
                'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-3-tooltip'
              )}
              showDivider
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(100, { minDecimals: 2 })} USDC
                </Typography>
              }
            />
          </Grid>
          <Grid item xs={6}>
            <InfoRow
              title={t(
                'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-2'
              )}
              toolTipInfo={t(
                'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-2-tooltip'
              )}
              showDivider
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(100, { minDecimals: 2 })} USDC
                </Typography>
              }
            />
            <InfoRow
              title={t(
                'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-4'
              )}
              toolTipInfo={t(
                'portfolio.transactions.withdrawalStatusSummary.withdrawalRequests.metric-4-tooltip'
              )}
              showDivider
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(100, { minDecimals: 2 })} USDC
                </Typography>
              }
            />
          </Grid>
        </Grid>
      </CustomInnerCardContent>
    </CustomCard>
  )
}

export default WithdrawalStatusSummary
