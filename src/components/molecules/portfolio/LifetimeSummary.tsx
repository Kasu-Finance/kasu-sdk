'use client'

import { Divider, Grid, Skeleton, Typography } from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'

import usePortfolioSummary from '@/hooks/portfolio/usePortfolioSummary'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const LifetimeSummary = () => {
  const { portfolioSummary, isLoading } = usePortfolioSummary()

  const { ksuPrice } = useKsuPrice()

  const { t } = useTranslation()

  if (isLoading) {
    return (
      <Grid item xs={6}>
        <ColoredBox sx={{ p: 0 }}>
          <Skeleton sx={{ fontSize: '1.3rem' }} />
          <Divider />

          <Grid container spacing={2}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Grid item xs={4} key={index}>
                <Skeleton sx={{ fontSize: '1.5rem' }} />
                <Divider />
                <Skeleton sx={{ fontSize: '2rem' }} />
              </Grid>
            ))}
          </Grid>
        </ColoredBox>
      </Grid>
    )
  }

  const ksuInUSD = convertToUSD(
    toBigNumber(portfolioSummary.lifetime.ksuBonusRewards || '0'),
    parseEther(ksuPrice || '0')
  )

  return (
    <Grid item xs={6}>
      <ColoredBox sx={{ p: 0 }}>
        <Typography
          variant='caption'
          component='span'
          textAlign='center'
          width='100%'
          display='block'
          py='6px'
          textTransform='capitalize'
        >
          {t('general.lifetime')}
        </Typography>
        <Divider />
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <InfoColumn
              title={t('portfolio.summary.yieldEarnings.title')}
              toolTipInfo={t('portfolio.summary.yieldEarnings.tooltip')}
              showDivider
              metric={
                <TokenAmount
                  amount={formatAmount(
                    portfolioSummary.lifetime.yieldEarnings || '0'
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
              title={t('portfolio.summary.ksuBonusRewards.title')}
              toolTipInfo={t('portfolio.summary.ksuBonusRewards.tooltip')}
              titleStyle={{ whiteSpace: 'nowrap' }}
              showDivider
              metric={
                <TokenAmount
                  amount={formatAmount(
                    portfolioSummary.lifetime.ksuBonusRewards || '0'
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
              title={t('portfolio.summary.protocolFeesEarned.title')}
              toolTipInfo={t('portfolio.summary.protocolFeesEarned.tooltip')}
              titleStyle={{ whiteSpace: 'nowrap' }}
              showDivider
              metric={
                <TokenAmount
                  amount={formatAmount(
                    portfolioSummary.lifetime.protocolFeesEarned || '0'
                  )}
                  symbol='USDC'
                  pt='6px'
                  pl={2}
                />
              }
            />
          </Grid>
        </Grid>
      </ColoredBox>
    </Grid>
  )
}

export default LifetimeSummary
