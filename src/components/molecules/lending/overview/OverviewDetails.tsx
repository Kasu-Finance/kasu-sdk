'use client'

import { Box, Card, Grid } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'

import useTranslation from '@/hooks/useTranslation'

import InfoRow from '@/components/atoms/InfoRow'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'

import { formatAmount } from '@/utils'
import formatDuration from '@/utils/formats/formatDuration'

const OverviewDetails: React.FC<{
  pool: PoolOverview
  poolDelegate: PoolDelegateProfileAndHistory
}> = ({ pool, poolDelegate }) => {
  const { t } = useTranslation()

  const lendingDuration = formatDuration(poolDelegate.delegateLendingHistory, {
    months: true,
    days: true,
  })

  return (
    <Box sx={{ mt: 3 }}>
      <Grid
        container
        direction='row'
        justifyContent='flex-start'
        alignItems='stretch'
        columnSpacing={3}
        sx={{ height: '248px' }}
      >
        <Grid item xs={6} sx={{ height: '100%' }} alignItems='stretch'>
          <Card sx={{ p: 2, height: '100%' }}>
            <Grid container columnSpacing={2} sx={{ pb: 3 }}>
              <Grid item xs={6}>
                <MetricWithSuffix
                  content={formatAmount(pool.totalValueLocked)}
                  suffix='USDC'
                  tooltipKey='lending.poolOverview.detailCard.tvl.tooltip'
                  titleKey='lending.poolOverview.detailCard.tvl.label'
                />
              </Grid>
              <Grid item xs={6}>
                <MetricWithSuffix
                  content={formatAmount(pool.loansUnderManagement)}
                  suffix='USDC'
                  tooltipKey='lending.poolOverview.detailCard.loansUnder.tooltip'
                  titleKey='lending.poolOverview.detailCard.loansUnder.label'
                />
              </Grid>
            </Grid>
            <Box className='light-blue-background' sx={{ mt: 1 }}>
              <Grid
                container
                justifyContent='space-between'
                columnSpacing={2}
                sx={{ pb: 5.1 }}
              >
                <Grid item xs={6}>
                  <MetricWithSuffix
                    content={formatAmount(pool.yieldEarned)}
                    suffix='USDC'
                    tooltipKey='lending.poolOverview.detailCard.totalPoolYieldEarnings.tooltip'
                    titleKey='lending.poolOverview.detailCard.totalPoolYieldEarnings.label'
                  />
                </Grid>
                <Grid item xs={6}>
                  <MetricWithSuffix
                    content={formatAmount(+poolDelegate.historicLossRate)}
                    suffix='USDC'
                    tooltipKey='lending.poolOverview.detailCard.totalLossRate.tooltip'
                    titleKey='lending.poolOverview.detailCard.totalLossRate.label'
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6} sx={{ height: '100%' }} alignItems='stretch'>
          <Card sx={{ p: 2, height: '100%' }}>
            <Grid container columnSpacing={2} sx={{ pb: 3 }}>
              <Grid item xs={6}>
                <MetricWithSuffix
                  content={lendingDuration}
                  tooltipKey='lending.poolOverview.detailCard.lendingHistory.tooltip'
                  titleKey='lending.poolOverview.detailCard.lendingHistory.label'
                />
              </Grid>
              <Grid item xs={6}>
                <MetricWithSuffix
                  content={pool.assetClass}
                  tooltipKey='lending.poolOverview.detailCard.assetClass.tooltip'
                  titleKey='lending.poolOverview.detailCard.assetClass.label'
                />
              </Grid>
            </Grid>
            <Box
              className='light-blue-background'
              sx={{ mt: 1, borderRadius: 1 }}
            >
              <InfoRow
                toolTipInfo={t(
                  'lending.poolOverview.detailCard.industry.tooltip'
                )}
                title={t('lending.poolOverview.detailCard.industry.label')}
                showDivider
                metric={pool.industryExposure}
              />
              <InfoRow
                toolTipInfo={t('lending.poolOverview.detailCard.terms.tooltip')}
                title={t('lending.poolOverview.detailCard.terms.label')}
                showDivider
                metric={pool.poolInvestmentTerm}
              />
              <InfoRow
                toolTipInfo={t(
                  'lending.poolOverview.detailCard.apyStructure.tooltip'
                )}
                title={t('lending.poolOverview.detailCard.apyStructure.label')}
                metric={pool.poolApyStructure}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default OverviewDetails
