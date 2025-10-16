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
import { formatEther, formatUnits, parseEther } from 'ethers/lib/utils'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'
import useUserBalance from '@/hooks/web3/useUserBalance'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'

import sdkConfig, { USDC } from '@/config/sdk'
import { convertToUSD, formatAccount, formatAmount, toBigNumber } from '@/utils'

const PortfolioWalletTab = () => {
  const currentDevice = useDeviceDetection()

  const isMobile = currentDevice === Device.MOBILE

  const { t } = getTranslation()

  const { address } = usePrivyAuthenticated()

  const { balance: ksuBalance, decimals: ksuDecimals } = useUserBalance(
    sdkConfig.contracts.KSUToken
  )

  const { balance: usdcBalance, decimals: usdcDecimals } = useUserBalance(USDC)

  const { ksuPrice } = useKsuPrice()

  const ksuInUSD = convertToUSD(ksuBalance, parseEther(ksuPrice || '0'))

  const walletBalances = {
    KASU: formatUnits(ksuBalance, ksuDecimals),
    usdc: formatUnits(usdcBalance, usdcDecimals),
  } as const

  const walletWithBalance = Object.entries(walletBalances)
    .filter(([_, amount]) => !toBigNumber(amount).isZero())
    .map(([symbol, amount]) => ({ amount, symbol }))

  return (
    <>
      <CardHeader
        title={t('portfolio.wallet.title')}
        titleTypographyProps={{
          fontSize: { xs: 16, sm: 24 },
        }}
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            height: 42,
            p: 1,
          },
        })}
      />
      <CardContent
        sx={(theme) => ({
          [theme.breakpoints.down('sm')]: {
            p: 1,
          },
        })}
      >
        <InfoColumn
          title={t('portfolio.wallet.connectedWallet')}
          showDivider
          titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
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
              {address
                ? isMobile
                  ? formatAccount(address)
                  : `0x ${address.substring(2).match(/.{4}/g)?.join(' ')}`
                : '-'}{' '}
            </Typography>
          }
        />
        <Grid mt={2} container spacing={2} columns={{ xs: 6, sm: 12 }}>
          <Grid item xs={6}>
            <ColoredBox
              sx={(theme) => ({
                [theme.breakpoints.down('sm')]: {
                  p: 1,
                },
              })}
            >
              <InfoColumn
                title={`${t('general.wallet')} ${t('general.balance')}`}
                titleStyle={{
                  textTransform: 'capitalize',
                  fontSize: { xs: 12, sm: 14 },
                }}
                titleContainerSx={(theme) => ({
                  [theme.breakpoints.down('sm')]: {
                    px: 0,
                  },
                })}
                toolTipInfo={t('portfolio.wallet.metric-1-tooltip')}
                showDivider={!isMobile}
                metric={
                  <Box pt='6px' pl={{ xs: 0, sm: 2 }} textTransform='uppercase'>
                    {walletWithBalance.length ? (
                      walletWithBalance.map((balance) => (
                        <TokenAmount
                          key={balance.symbol}
                          {...balance}
                          amountProps={{ variant: 'body1' }}
                          symbolProps={{ variant: 'caption' }}
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
            {!isMobile && (
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
            )}
          </Grid>
          <Grid item xs={6}>
            <ColoredBox
              sx={(theme) => ({
                [theme.breakpoints.down('sm')]: {
                  p: 1,
                },
              })}
            >
              <Grid container spacing={2} columns={{ xs: 6, sm: 12 }}>
                <Grid item xs={6}>
                  <InfoColumn
                    title={t('portfolio.wallet.metric-2')}
                    toolTipInfo={t('portfolio.wallet.metric-2-tooltip')}
                    titleStyle={{ fontSize: { xs: 12, sm: 14 } }}
                    showDivider
                    titleContainerSx={(theme) => ({
                      [theme.breakpoints.down('sm')]: {
                        px: 0,
                      },
                    })}
                    metric={
                      <TokenAmount
                        amount={formatAmount(
                          formatUnits(ksuBalance || '0', ksuDecimals)
                        )}
                        symbol='KASU'
                        usdValue={formatAmount(formatEther(ksuInUSD) || '0')}
                        pt='6px'
                        pl={{ xs: 0, sm: 2 }}
                        sx={(theme) => ({
                          [theme.breakpoints.down('sm')]: {
                            '.MuiBox-root': {
                              display: 'inline-block',
                              ml: '1ch',
                            },
                          },
                        })}
                      />
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <InfoColumn
                    title={t('general.availableFunds')}
                    titleStyle={{
                      textTransform: 'capitalize',
                      fontSize: { xs: 12, sm: 14 },
                    }}
                    toolTipInfo={t('portfolio.wallet.metric-3-toolip')}
                    titleContainerSx={(theme) => ({
                      [theme.breakpoints.down('sm')]: {
                        px: 0,
                      },
                    })}
                    showDivider
                    metric={
                      <TokenAmount
                        amount={formatAmount(
                          formatUnits(usdcBalance || '0', usdcDecimals)
                        )}
                        symbol='USDC'
                        pt='6px'
                        pl={{ xs: 0, sm: 2 }}
                      />
                    }
                  />
                </Grid>
              </Grid>
            </ColoredBox>
            {!isMobile && (
              <Button
                variant='contained'
                sx={{ mt: 2, mx: 'auto', display: 'flex' }}
                startIcon={<WalletIcon />}
                disabled={usdcBalance.isZero()}
              >
                {t('general.buyKSU')}
              </Button>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </>
  )
}

export default PortfolioWalletTab
