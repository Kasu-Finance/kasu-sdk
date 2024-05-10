'use client'

import { Divider, Grid, Skeleton, Typography } from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'

import usePortfolioSummary from '@/hooks/portfolio/usePortfolioSummary'
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
  const { portfolioSummary, isLoading } = usePortfolioSummary()

  const { ksuPrice } = useKsuPrice()

  const { t } = useTranslation()

  if (isLoading) {
    return (
      <Grid item xs={6} container spacing={2} mt='auto'>
        <Grid item xs={4}>
          <Skeleton sx={{ fontSize: '1.5rem' }} />
          <Divider />
          <Skeleton sx={{ fontSize: '2.6rem' }} />
        </Grid>
        <Grid item xs={4}>
          <Skeleton sx={{ fontSize: '1.5rem' }} />
          <Divider />
          <Skeleton sx={{ fontSize: '2rem' }} />
        </Grid>
        <Grid item xs={4}>
          <Skeleton sx={{ fontSize: '1.5rem' }} />
          <Divider />
          <Skeleton sx={{ fontSize: '2rem' }} />
        </Grid>
      </Grid>
    )
  }

  const ksuInUSD = convertToUSD(
    toBigNumber(portfolioSummary.current.totalKsuLocked),
    parseEther(ksuPrice || '0')
  )

  return (
    <Grid item xs={6} container spacing={2} mt='auto'>
      <Grid item xs={4}>
        <InfoColumn
          title={t('portfolio.summary.totalKsuLocked.title')}
          toolTipInfo={t('portfolio.summary.totalKsuLocked.tooltip')}
          showDivider
          titleStyle={{ whiteSpace: 'nowrap' }}
          metric={
            <TokenAmount
              amount={formatAmount(
                portfolioSummary.current.totalKsuLocked || '0'
              )}
              symbol='KSU'
              usdValue={formatAmount(formatEther(ksuInUSD || '0'))}
              pt='6px'
              pl={2}
            />
          }
        />
      </Grid>
      <Grid item xs={4}>
        <InfoColumn
          title={t('portfolio.summary.lendingPoolInvestment.title')}
          toolTipInfo={t('portfolio.summary.lendingPoolInvestment.tooltip')}
          showDivider
          titleStyle={{ whiteSpace: 'nowrap' }}
          metric={
            <TokenAmount
              amount={formatAmount(
                portfolioSummary.current.totalLendingPoolInvestments || '0'
              )}
              symbol='USDC'
              pt='6px'
              pl={2}
            />
          }
        />
      </Grid>
      <Grid item xs={4}>
        <InfoColumn
          title={t('portfolio.summary.weightedApy.title')}
          toolTipInfo={t('portfolio.summary.weightedApy.tooltip')}
          showDivider
          titleStyle={{ whiteSpace: 'nowrap' }}
          metric={
            <Typography
              variant='h6'
              component='span'
              display='block'
              pt='6px'
              pl={2}
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
