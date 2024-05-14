import WalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CachedIcon from '@mui/icons-material/Cached'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { formatEther, formatUnits, parseEther } from 'ethers/lib/utils'

import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useUserBalance from '@/hooks/web3/useUserBalance'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import sdkConfig, { USDC } from '@/config/sdk'
import { convertToUSD, formatAmount, toBigNumber } from '@/utils'

const PortfolioWalletTab = () => {
  const { t } = useTranslation()

  const { account } = useWeb3React()

  const { balance: ksuBalance, decimals: ksuDecimals } = useUserBalance(
    sdkConfig.contracts.KSUToken
  )

  const { balance: usdcBalance, decimals: usdcDecimals } = useUserBalance(USDC)

  const { ksuPrice } = useKsuPrice()

  const ksuInUSD = convertToUSD(ksuBalance, parseEther(ksuPrice || '0'))

  const walletBalances = {
    ksu: formatUnits(ksuBalance, ksuDecimals),
    usdc: formatUnits(usdcBalance, usdcDecimals),
  } as const

  const walletWithBalance = Object.entries(walletBalances)
    .filter(([_, amount]) => !toBigNumber(amount).isZero())
    .map(([symbol, amount]) => ({ amount, symbol }))

  return (
    <>
      <CardHeader title={t('portfolio.wallet.title')} />
      <CardContent>
        <InfoColumn
          title={t('portfolio.wallet.connectedWallet')}
          showDivider
          metric={
            <Typography
              variant='h6'
              component='span'
              display='block'
              pt='6px'
              pl={2}
            >
              {account
                ? `0x ${account.substring(2).match(/.{4}/g).join(' ')}`
                : '-'}{' '}
            </Typography>
          }
        />
        <Grid mt={2} container spacing={2}>
          <Grid item xs={6}>
            <ColoredBox>
              <InfoColumn
                title={`${t('general.wallet')} ${t('general.balance')}`}
                titleStyle={{ textTransform: 'capitalize' }}
                toolTipInfo={t('portfolio.wallet.metric-1-tooltip')}
                showDivider
                metric={
                  <Box pt='6px' pl={2} textTransform='uppercase'>
                    {walletWithBalance.length ? (
                      walletWithBalance.map((balance) => (
                        <TokenAmount
                          key={balance.symbol}
                          {...balance}
                          amountVariant='body1'
                          symbolVariant='caption'
                        />
                      ))
                    ) : (
                      <Typography variant='h6' component='span'>
                        -
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ColoredBox>
            <Button
              variant='contained'
              sx={{
                mt: 2,
                mx: 'auto',
                display: 'flex',
              }}
              startIcon={<CachedIcon />}
              disabled={!walletWithBalance.length}
            >
              {t('general.convertToKSU')}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <ColoredBox>
              <Grid container spacing={2}>
                <Grid item xs={5}>
                  <InfoColumn
                    title={t('portfolio.wallet.metric-2')}
                    toolTipInfo={t('portfolio.wallet.metric-2-tooltip')}
                    showDivider
                    metric={
                      <TokenAmount
                        amount={formatAmount(
                          formatUnits(ksuBalance || '0', ksuDecimals)
                        )}
                        symbol='KSU'
                        usdValue={formatAmount(formatEther(ksuInUSD) || '0')}
                        pt='6px'
                        pl={2}
                      />
                    }
                  />
                </Grid>
                <Grid item xs={5}>
                  <InfoColumn
                    title={t('general.availableFunds')}
                    titleStyle={{ textTransform: 'capitalize' }}
                    toolTipInfo={t('portfolio.wallet.metric-3-toolip')}
                    showDivider
                    metric={
                      <TokenAmount
                        amount={formatAmount(
                          formatUnits(usdcBalance || '0', usdcDecimals)
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
            <Button
              variant='contained'
              sx={{ mt: 2, mx: 'auto', display: 'flex' }}
              startIcon={<WalletIcon />}
              disabled={usdcBalance.isZero()}
            >
              {t('general.buyKSU')}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </>
  )
}

export default PortfolioWalletTab
