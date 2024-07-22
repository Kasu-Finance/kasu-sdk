'use client'

import { Divider, Grid, Skeleton, Typography } from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'

import usePortfolioSummary from '@/hooks/portfolio/usePortfolioSummary'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import {
  convertToUSD,
  formatAmount,
  formatPercentage,
  toBigNumber,
} from '@/utils'

const CurrentSummary = () => {
  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

  const { portfolioSummary, isLoading } = usePortfolioSummary()

  const { ksuPrice } = useKsuPrice()

  const { t } = useTranslation()

  if (isLoading || !portfolioSummary) {
    return (
      <Grid item xs={6} container spacing={2} mt='auto'>
        {Array.from({ length: 3 }).map((_, index) => (
          <Grid item xs={4} key={index}>
            <Skeleton sx={{ fontSize: '1.5rem' }} />
            <Divider />
            <Skeleton sx={{ fontSize: '2.6rem' }} />
          </Grid>
        ))}
      </Grid>
    )
  }

  const ksuInUSD = convertToUSD(
    toBigNumber(portfolioSummary.current.totalKsuLocked),
    parseEther(ksuPrice || '0')
  )

  return (
    <Grid container item lg={6} xs={12} spacing={isMobile ? 0 : 2} mt='auto'>
      <Grid item sm={4} xs={12}>
        <InfoColumn
          title={t('portfolio.summary.totalKsuLocked.title')}
          toolTipInfo={t('portfolio.summary.totalKsuLocked.tooltip')}
          showDivider
          titleStyle={{ whiteSpace: 'nowrap', fontSize: { xs: 10, sm: 14 } }}
          titleContainerSx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              px: 0,
            },
          })}
          metric={
            <TokenAmount
              amount={formatAmount(
                portfolioSummary.current.totalKsuLocked || '0'
              )}
              symbol='KSU'
              usdValue={formatAmount(formatEther(ksuInUSD || '0'))}
              pt='6px'
              pl={{ xs: 0, sm: 2 }}
              sx={(theme) => ({
                width: 'fit-content',
                [theme.breakpoints.down('sm')]: {
                  '.MuiBox-root': {
                    display: 'inline-block',
                    ml: 1,
                  },
                },
              })}
            />
          }
        />
      </Grid>
      <Grid item sm={4} xs={6}>
        <InfoColumn
          title={t('portfolio.summary.lendingPoolInvestment.title')}
          toolTipInfo={t('portfolio.summary.lendingPoolInvestment.tooltip')}
          showDivider
          titleStyle={{ whiteSpace: 'nowrap', fontSize: { xs: 10, sm: 14 } }}
          titleContainerSx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              px: 0,
            },
          })}
          metric={
            <TokenAmount
              amount={formatAmount(
                portfolioSummary.current.totalLendingPoolInvestments || '0'
              )}
              symbol='USDC'
              pt='6px'
              pl={{ xs: 0, sm: 2 }}
              sx={{ width: 'fit-content' }}
            />
          }
        />
      </Grid>
      <Grid item sm={4} xs={6}>
        <InfoColumn
          title={t('portfolio.summary.weightedApy.title')}
          toolTipInfo={t('portfolio.summary.weightedApy.tooltip')}
          showDivider
          titleStyle={{ whiteSpace: 'nowrap', fontSize: { xs: 10, sm: 14 } }}
          titleContainerSx={(theme) => ({
            [theme.breakpoints.down('sm')]: {
              px: 0,
            },
          })}
          metric={
            <Typography
              variant='h6'
              component='span'
              display='block'
              pt='6px'
              pl={{ xs: 0, sm: 2 }}
            >
              {formatPercentage(
                portfolioSummary.current.weightedAverageApy || '0'
              )}
            </Typography>
          }
        />
      </Grid>
    </Grid>
  )
}

export default CurrentSummary
