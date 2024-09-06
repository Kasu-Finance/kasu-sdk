'use client'

import { Box, Card, Grid, Typography } from '@mui/material'
import {
  PoolDelegateProfileAndHistory,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'
import ToolTip from '@/components/atoms/ToolTip'
import TermsAndStructureTooltip from '@/components/molecules/tooltips/TermsAndStructure'

import dayjs from '@/dayjs'
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

  const totalLossRateParts = t(
    'lending.poolOverview.detailCard.totalLossRate.label'
  ).split(' ')

  const totalLossRate = {
    total: totalLossRateParts[0],
    lossRate: totalLossRateParts.slice(1).join(' '),
  }

  return (
    <Box>
      <Grid container columns={isMobile ? 6 : 12}>
        <Grid item xs={6}>
          <Card
            sx={(theme) => ({
              p: 2,
              [theme.breakpoints.down('sm')]: {
                p: 1,
              },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            })}
          >
            <Grid container columnSpacing={2} sx={{ pb: 3 }} columns={12}>
              <Grid item xs={6}>
                <InfoColumn
                  title={t('lending.poolOverview.detailCard.tvl.label')}
                  titleStyle={{
                    maxWidth: { xs: 'unset', sm: 90 },
                    fontSize: { xs: 10, sm: 14 },
                  }}
                  titleContainerSx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                      px: 0,
                    },
                  })}
                  showDivider
                  toolTipInfo={t('lending.poolOverview.detailCard.tvl.tooltip')}
                  metric={
                    <TokenAmount
                      px={{ xs: 0, sm: 2 }}
                      py={{ xs: 0, sm: '6px' }}
                      amount={formatAmount(pool.totalValueLocked || '0')}
                      symbol='USDC'
                    />
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <InfoColumn
                  title={t('lending.poolOverview.detailCard.loansUnder.label')}
                  titleStyle={{
                    maxWidth: { xs: 'unset', sm: 90 },
                    fontSize: { xs: 10, sm: 14 },
                  }}
                  titleContainerSx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                      px: 0,
                    },
                  })}
                  showDivider
                  toolTipInfo={t(
                    'lending.poolOverview.detailCard.loansUnder.tooltip'
                  )}
                  metric={
                    <TokenAmount
                      px={{ xs: 0, sm: 2 }}
                      py={{ xs: 0, sm: '6px' }}
                      amount={formatAmount(pool.loansUnderManagement || '0')}
                      symbol='USDC'
                    />
                  }
                />
              </Grid>
            </Grid>
            <ColoredBox p={{ xs: 1, sm: 0 }}>
              <Grid
                container
                justifyContent='space-between'
                direction={isMobile ? 'column' : 'row'}
                columnSpacing={2}
                pb={{ xs: 0, sm: 5.1 }}
              >
                <Grid item xs={6}>
                  <InfoColumn
                    title={t(
                      'lending.poolOverview.detailCard.totalPoolYieldEarnings.label'
                    )}
                    subtitle={t(
                      'lending.poolOverview.detailCard.totalPoolYieldEarnings.sublabel'
                    )}
                    titleStyle={{
                      display: { xs: 'inline-block', sm: 'block' },
                      fontSize: { xs: 10, sm: 14 },
                    }}
                    subtitleStyle={{
                      display: { xs: 'inline', sm: 'block' },
                      variant: 'subtitle2',
                      ml: { xs: '0.5ch', sm: 0 },
                      fontSize: { xs: 10, sm: 14 },
                    }}
                    titleContainerSx={(theme) => ({
                      [theme.breakpoints.down('sm')]: {
                        px: 0,
                      },
                    })}
                    toolTipInfo={t(
                      'lending.poolOverview.detailCard.totalPoolYieldEarnings.tooltip'
                    )}
                    showDivider
                    metric={
                      <TokenAmount
                        px={{ xs: 0, sm: 2 }}
                        py={{ xs: 0, sm: '6px' }}
                        amount={formatAmount(pool.yieldEarned || '0')}
                        symbol='USDC'
                      />
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <InfoColumn
                    title={totalLossRate.total}
                    subtitle={totalLossRate.lossRate}
                    titleStyle={{
                      display: { xs: 'inline-block', sm: 'block' },
                      fontSize: { xs: 10, sm: 14 },
                    }}
                    subtitleStyle={{
                      display: { xs: 'inline', sm: 'block' },
                      fontSize: { xs: 10, sm: 14 },
                      variant: 'subtitle2',
                      ml: { xs: '0.5ch', sm: 0 },
                    }}
                    titleContainerSx={(theme) => ({
                      [theme.breakpoints.down('sm')]: {
                        px: 0,
                        mt: 1,
                      },
                    })}
                    toolTipInfo={t(
                      'lending.poolOverview.detailCard.totalLossRate.tooltip'
                    )}
                    showDivider
                    metric={
                      <TokenAmount
                        px={{ xs: 0, sm: 2 }}
                        py={{ xs: 0, sm: '6px' }}
                        amount={formatAmount(
                          +poolDelegate?.historicLossRate || '0'
                        )}
                        symbol='%'
                      />
                    }
                  />
                </Grid>
              </Grid>
            </ColoredBox>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card
            sx={(theme) => ({
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',

              [theme.breakpoints.down('sm')]: {
                p: 1,
              },
            })}
          >
            <Grid container columnSpacing={2} sx={{ pb: 3 }}>
              <Grid item xs={6}>
                <InfoColumn
                  toolTipInfo={t(
                    'lending.poolOverview.detailCard.lendingHistory.tooltip'
                  )}
                  titleContainerSx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                      px: 0,
                      mt: 2,
                    },
                  })}
                  showDivider
                  title={t(
                    'lending.poolOverview.detailCard.lendingHistory.label'
                  )}
                  titleStyle={{
                    fontSize: { xs: 10, sm: 14 },
                  }}
                  metric={
                    <Typography
                      variant='h6'
                      component='span'
                      display='block'
                      px={{ xs: 0, sm: 2 }}
                      py='6px'
                      fontSize={{ xs: 12, sm: 20 }}
                      fontWeight={{ xs: 400, sm: 500 }}
                    >
                      {lendingDuration}
                    </Typography>
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <InfoColumn
                  toolTipInfo={t(
                    'lending.poolOverview.detailCard.assetClass.tooltip'
                  )}
                  titleContainerSx={(theme) => ({
                    [theme.breakpoints.down('sm')]: {
                      px: 0,
                      mt: 2,
                    },
                  })}
                  showDivider
                  title={t('lending.poolOverview.detailCard.assetClass.label')}
                  titleStyle={{
                    fontSize: { xs: 10, sm: 14 },
                  }}
                  metric={
                    <Typography
                      variant='h6'
                      component='span'
                      display='block'
                      px={{ xs: 0, sm: 2 }}
                      py='6px'
                      fontSize={{ xs: 12, sm: 20 }}
                      fontWeight={{ xs: 400, sm: 500 }}
                    >
                      {pool.assetClass}
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
            <ColoredBox px={{ xs: 1, sm: 0 }}>
              <InfoRow
                toolTipInfo={t(
                  'lending.poolOverview.detailCard.industry.tooltip'
                )}
                title={t('lending.poolOverview.detailCard.industry.label')}
                titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
                sx={isMobile ? { px: 0, mb: 0.5 } : undefined}
                showDivider
                metric={
                  <Typography
                    variant='inherit'
                    maxWidth={165}
                    textAlign='right'
                    fontSize={{ xs: 12, sm: 14 }}
                  >
                    {pool.industryExposure}
                  </Typography>
                }
              />
              <InfoRow
                toolTipInfo={<ToolTip title={<TermsAndStructureTooltip />} />}
                title={t('lending.poolOverview.detailCard.terms.label')}
                titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
                sx={isMobile ? { p: 0, my: 1 } : undefined}
                showDivider
                metric={
                  <Typography
                    variant='inherit'
                    textAlign='right'
                    fontSize={{ xs: 12, sm: 14 }}
                  >
                    {pool.poolInvestmentTerm}
                  </Typography>
                }
              />
              <InfoRow
                toolTipInfo={t(
                  'lending.poolOverview.detailCard.apyStructure.tooltip'
                )}
                title={t('lending.poolOverview.detailCard.apyStructure.label')}
                titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
                showDivider={pool.poolApyStructure === 'Fixed'}
                sx={isMobile ? { p: 0, mt: 0.5, pb: 1 } : undefined}
                metric={
                  <Typography
                    variant='inherit'
                    maxWidth={165}
                    textAlign='right'
                    fontSize={{ xs: 12, sm: 14 }}
                  >
                    {pool.poolApyStructure}
                  </Typography>
                }
              />
              {pool.poolApyStructure === 'Fixed' && (
                <InfoRow
                  toolTipInfo={t(
                    'lending.poolOverview.detailCard.fixedApyExpiry.tooltip'
                  )}
                  title={t(
                    'lending.poolOverview.detailCard.fixedApyExpiry.label'
                  )}
                  titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
                  sx={isMobile ? { p: 0, mt: 0.5, pb: 1 } : undefined}
                  metric={
                    <Typography
                      variant='inherit'
                      maxWidth={165}
                      textAlign='right'
                      fontSize={{ xs: 12, sm: 14 }}
                    >
                      {pool.apyExpiryDate
                        ? dayjs(pool.apyExpiryDate).format('DD MMMM, YYYY')
                        : 'N/A'}
                    </Typography>
                  }
                />
              )}
            </ColoredBox>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default OverviewDetails
