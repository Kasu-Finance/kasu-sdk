'use client'

import { Divider, Grid, Skeleton, Typography } from '@mui/material'
import { formatEther, parseEther } from 'ethers/lib/utils'

import usePortfolioSummary from '@/hooks/portfolio/usePortfolioSummary'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
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
  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

  if (isLoading || !portfolioSummary) {
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
    <Grid item lg={6} xs={12}>
      <ColoredBox p={{ xs: 1, sm: 0 }}>
        <Typography
          variant={isMobile ? 'h6' : 'caption'}
          component='span'
          textAlign={isMobile ? 'left' : 'center'}
          width='100%'
          display='block'
          py={isMobile ? 0 : '6px'}
          textTransform='capitalize'
        >
          {t('general.lifetime')}
        </Typography>
        {!isMobile && <Divider />}
        <Grid container spacing={2}>
          <Grid item sm={4} xs={6}>
            <InfoColumn
              title={t('portfolio.summary.yieldEarnings.title')}
              toolTipInfo={t('portfolio.summary.yieldEarnings.tooltip')}
              showDivider
              titleStyle={{
                whiteSpace: 'nowrap',
                fontSize: { xs: 10, sm: 14 },
              }}
              titleContainerSx={(theme) => ({
                [theme.breakpoints.down('sm')]: {
                  px: 0,
                },
              })}
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
          <Grid item sm={4} xs={12} order={isMobile ? 3 : undefined}>
            <InfoColumn
              title={t('portfolio.summary.ksuBonusRewards.title')}
              toolTipInfo={t('portfolio.summary.ksuBonusRewards.tooltip')}
              showDivider
              titleStyle={{
                whiteSpace: 'nowrap',
                fontSize: { xs: 10, sm: 14 },
              }}
              titleContainerSx={(theme) => ({
                [theme.breakpoints.down('sm')]: {
                  px: 0,
                },
              })}
              metric={
                <TokenAmount
                  amount={formatAmount(
                    portfolioSummary.lifetime.ksuBonusRewards || '0'
                  )}
                  symbol='KSU'
                  usdValue={formatAmount(formatEther(ksuInUSD || '0'))}
                  pt='6px'
                  pl={2}
                  sx={(theme) => ({
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
              title={t('portfolio.summary.protocolFeesEarned.title')}
              toolTipInfo={t('portfolio.summary.protocolFeesEarned.tooltip')}
              titleStyle={{
                whiteSpace: 'nowrap',
                fontSize: { xs: 10, sm: 14 },
              }}
              titleContainerSx={(theme) => ({
                [theme.breakpoints.down('sm')]: {
                  px: 0,
                },
              })}
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
