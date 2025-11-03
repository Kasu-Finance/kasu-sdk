'use client'

import { Box, Button, Divider, Grid, Typography } from '@mui/material'
import { useWallets } from '@privy-io/react-auth'
import { formatEther, formatUnits, parseEther } from 'ethers/lib/utils'
import { useAccount } from 'wagmi'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useUserBalance from '@/hooks/web3/useUserBalance'

import InfoRow from '@/components/atoms/InfoRow'
import BuyKsuOverviewSkeleton from '@/components/organisms/portfolio/PortfolioWalletTab/BuyKsuOverviewSkeleton'

import { ModalsKeys } from '@/context/modal/modal.types'

import sdkConfig from '@/config/sdk'
import { SupportedTokens } from '@/constants/tokens'
import { convertToUSD, formatAmount } from '@/utils'

const BuyKsuOverview = () => {
  const { t } = getTranslation()
  const supportedToken = useSupportedTokenInfo()

  const { address } = useAccount()

  const { wallets } = useWallets()

  const wallet = wallets.find(
    (wallet) => wallet.address.toLowerCase() === address?.toLowerCase()
  )

  const isPrivy = wallet?.walletClientType === 'privy'

  const { openModal } = useModalState()

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

  const handleOpen = () => openModal({ name: ModalsKeys.UNRELEASED_FEATURE })

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
                KASU
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
          toolTipInfo='The current USDC balance in your wallet currently connected to the Kasu dApp that can be used to purchase KASU tokens via the dApp.'
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
      {isPrivy && (
        <Grid item xs={12} display='flex' justifyContent='center' mt={4}>
          <Button
            variant='contained'
            fullWidth
            sx={{ maxWidth: 368, textTransform: 'capitalize' }}
            onClick={handleOpen}
          >
            {t('general.addFunds')}
          </Button>
        </Grid>
      )}
    </>
  )
}

export default BuyKsuOverview
