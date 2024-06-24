'use client'

import { Box, Card, Grid, Typography } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import InfoColumn from '@/components/atoms/InfoColumn'
import InfoRow from '@/components/atoms/InfoRow'
import MetricWithSuffix from '@/components/atoms/MetricWithSuffix'
import TokenAmount from '@/components/atoms/TokenAmount'

import { formatAmount } from '@/utils'
import formatDuration from '@/utils/formats/formatDuration'

const OverviewDetails: React.FC<{
  pool: PoolOverview
  poolDelegate: PoolDelegateProfileAndHistory
}> = ({ pool, poolDelegate }) => {
  const { t } = useTranslation()
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  const lendingDuration = formatDuration(poolDelegate.delegateLendingHistory, {
    years: true,
    months: true,
    days: true,
  })

  return (
    <Box>
      <Grid container columns={isMobile ? 6 : 12}>
        <Grid item xs={6}>
          <Card
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Grid
              container
              columnSpacing={2}
              sx={{ pb: 3 }}
              columns={isMobile ? 6 : 12}
            >
              <Grid item xs={6}>
                <MetricWithSuffix
                  content={formatAmount(pool.totalValueLocked || '0')}
                  suffix='USDC'
                  tooltipKey='lending.poolOverview.detailCard.tvl.tooltip'
                  titleKey='lending.poolOverview.detailCard.tvl.label'
                />
              </Grid>
              <Grid item xs={6}>
                <MetricWithSuffix
                  content={formatAmount(pool.loansUnderManagement || '0')}
                  suffix='USDC'
                  tooltipKey='lending.poolOverview.detailCard.loansUnder.tooltip'
                  titleKey='lending.poolOverview.detailCard.loansUnder.label'
                />
              </Grid>
            </Grid>
            <Box className='light-colored-background'>
              <Grid
                container
                justifyContent='space-between'
                direction={isMobile ? 'column' : 'row'}
                columnSpacing={2}
                sx={{ pb: 5.1 }}
              >
                <Grid item xs={6}>
                  <InfoColumn
                    title={t(
                      'lending.poolOverview.detailCard.totalPoolYieldEarnings.label'
                    )}
                    subtitle={t(
                      'lending.poolOverview.detailCard.totalPoolYieldEarnings.sublabel'
                    )}
                    subtitleStyle={{
                      display: 'block',
                      variant: 'subtitle2',
                      ml: 0,
                    }}
                    toolTipInfo={t(
                      'lending.poolOverview.detailCard.totalPoolYieldEarnings.tooltip'
                    )}
                    showDivider
                    metric={
                      <TokenAmount
                        px={2}
                        py='6px'
                        amount={formatAmount(pool.yieldEarned || '0')}
                        symbol='USDC'
                      />
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <InfoColumn
                    title={t(
                      'lending.poolOverview.detailCard.totalLossRate.label'
                    )}
                    subtitle={t(
                      'lending.poolOverview.detailCard.totalLossRate.sublabel'
                    )}
                    subtitleStyle={{
                      display: 'block',
                      variant: 'subtitle2',
                      ml: 0,
                    }}
                    toolTipInfo={t(
                      'lending.poolOverview.detailCard.totalLossRate.tooltip'
                    )}
                    showDivider
                    metric={
                      <TokenAmount
                        px={2}
                        py='6px'
                        amount={formatAmount(
                          +poolDelegate?.historicLossRate || '0'
                        )}
                        symbol='%'
                      />
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Grid
              container
              columnSpacing={2}
              sx={{ pb: 3 }}
              columns={isMobile ? 6 : 12}
            >
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
            <Box className='light-colored-background'>
              <InfoRow
                toolTipInfo={t(
                  'lending.poolOverview.detailCard.industry.tooltip'
                )}
                title={t('lending.poolOverview.detailCard.industry.label')}
                showDivider
                metric={
                  <Typography variant='inherit' maxWidth={300}>
                    {pool.industryExposure}
                  </Typography>
                }
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
