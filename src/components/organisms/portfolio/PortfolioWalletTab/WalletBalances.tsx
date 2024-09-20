'use client'

import { Button, Divider, Grid, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'
import useWalletBalances from '@/hooks/web3/useWalletBalances'

import InfoRow from '@/components/atoms/InfoRow'
import WalletBalancesSkeleton from '@/components/organisms/portfolio/PortfolioWalletTab/WalletBalancesSkeleton'

import { formatAmount } from '@/utils'

const WalletBalances = () => {
  const { t } = useTranslation()

  const { walletWithBalance, isLoading } = useWalletBalances()

  if (isLoading) {
    return <WalletBalancesSkeleton />
  }

  return (
    <>
      <Grid container columnSpacing={4} mt={1.5}>
        <Grid item xs={6}>
          <Divider />
        </Grid>
        <Grid item xs={6}>
          <Divider />
        </Grid>
        {walletWithBalance.map((token) => (
          <Grid key={token.symbol} item xs={6}>
            <InfoRow
              title={token.symbol.toUpperCase()}
              metric={
                <Typography variant='baseMdBold'>
                  {formatAmount(token.amount, { minDecimals: 2 })}
                </Typography>
              }
              showDivider
            />
          </Grid>
        ))}
        <Grid item xs={12} display='flex' justifyContent='center' mt={4}>
          <Button
            variant='contained'
            fullWidth
            sx={{ maxWidth: 368, height: 48, textTransform: 'capitalize' }}
          >
            {t('general.convertToKSU')}
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

export default WalletBalances
