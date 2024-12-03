'use client'

import { Box, Button, Divider, Grid, Typography } from '@mui/material'
import { formatEther, formatUnits, parseEther } from 'ethers/lib/utils'

import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useUserBalance from '@/hooks/web3/useUserBalance'

import InfoRow from '@/components/atoms/InfoRow'
import BuyKsuOverviewSkeleton from '@/components/organisms/portfolio/PortfolioWalletTab/BuyKsuOverviewSkeleton'

import sdkConfig from '@/config/sdk'
import { SupportedTokens } from '@/constants/tokens'
import { convertToUSD, formatAmount } from '@/utils'

const BuyKsuOverview = () => {
  const { t } = getTranslation()
  const supportedToken = useSupportedTokenInfo()

  const {
    balance: ksuBalance,
    decimals: ksuDecimals,
    isUserBalanceLoading: ksuBalanceLoading,
  } = useUserBalance(sdkConfig.contracts.KSUToken)

  const {
    balance: usdcBalance,
    decimals: usdcDecimals,
    isUserBalanceLoading: usdcBalanceLoading,
  } = useUserBalance(supportedToken?.[SupportedTokens.USDC].address)

  const { ksuPrice, isLoading } = useKsuPrice()

  if (ksuBalanceLoading || isLoading || usdcBalanceLoading) {
    return <BuyKsuOverviewSkeleton />
  }

  const ksuInUSD = convertToUSD(ksuBalance, parseEther(ksuPrice || '0'))

  return (
    <>
      <Grid item xs={6}>
        <Divider sx={{ mt: 1.5 }} />
        <InfoRow
          title={t('portfolio.wallet.metric-2')}
          toolTipInfo={t('portfolio.wallet.metric-2-tooltip')}
          metric={
            <Box>
              <Typography variant='baseMdBold' mr='1ch'>
                {formatAmount(formatUnits(ksuBalance, ksuDecimals), {
                  minDecimals: 2,
                })}{' '}
                KSU
              </Typography>
              <Typography variant='baseMd' color='gray.middle'>
                {formatAmount(formatEther(ksuInUSD), {
                  minDecimals: 2,
                })}{' '}
                USDC
              </Typography>
            </Box>
          }
          showDivider
        />
      </Grid>
      <Grid item xs={6}>
        <Divider sx={{ mt: 1.5 }} />
        <InfoRow
          title={t('general.availableFunds')}
          titleStyle={{ textTransform: 'capitalize' }}
          toolTipInfo='info'
          metric={
            <Typography variant='baseMdBold'>
              {formatAmount(formatUnits(usdcBalance, usdcDecimals), {
                minDecimals: 2,
              })}{' '}
              USDC
            </Typography>
          }
          showDivider
        />
      </Grid>
      <Grid item xs={12} display='flex' justifyContent='center' mt={4}>
        <Button variant='contained' fullWidth sx={{ maxWidth: 368 }}>
          {t('general.buyKSU')}
        </Button>
      </Grid>
    </>
  )
}

export default BuyKsuOverview
