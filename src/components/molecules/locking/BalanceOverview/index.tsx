'use client'

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import LockClockIcon from '@mui/icons-material/LockClock'
import { Button, Grid } from '@mui/material'
import { formatEther, formatUnits, parseEther } from 'ethers/lib/utils'

import useModalState from '@/hooks/context/useModalState'
import useStakedKSU from '@/hooks/locking/useStakedKSU'
import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useUserBalance from '@/hooks/web3/useUserBalance'

import AuthenticateButton from '@/components/atoms/AuthenticateButton'
import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import { ModalsKeys } from '@/context/modal/modal.types'

import sdkConfig, { USDC } from '@/config/sdk'
import { convertToUSD, formatAmount } from '@/utils'

const BalanceOverview = () => {
  const { t } = useTranslation()
  const currentDevice = useDeviceDetection()
  const isMobile = currentDevice === Device.MOBILE

  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: ModalsKeys.LOCK })

  const { balance: ksuBalance, decimals: ksuDecimals } = useUserBalance(
    sdkConfig.contracts.KSUToken
  )

  const { balance: usdcBalance, decimals: usdcDecimals } = useUserBalance(USDC)

  const { stakedKSU } = useStakedKSU()

  const { ksuPrice } = useKsuPrice()

  const ksuInUSD = convertToUSD(ksuBalance, parseEther(ksuPrice || '0'))

  return (
    <CardWidget
      cardAction={
        <>
          {!isMobile && (
            <>
              <Button
                variant='contained'
                sx={{ width: 134 }}
                href='https://www.google.com'
                target='_blank'
                startIcon={<AccountBalanceWalletIcon />}
              >
                {t('general.buyKSU')}
              </Button>
              <AuthenticateButton
                sx={{ wixth: 143 }}
                variant='contained'
                onClick={handleOpen}
                startIcon={<LockClockIcon />}
              >
                {t('general.lockKSU')}
              </AuthenticateButton>
            </>
          )}
        </>
      }
    >
      <ColoredBox>
        <Grid container spacing={2}>
          <Grid item container xs={6}>
            <BalanceItem
              title={`${t('general.wallet')} ${t('general.balance')}`}
              toolTipInfo={t('locking.widgets.overview.metric-1-tooltip')}
              value={[
                formatAmount(formatUnits(ksuBalance || '0', ksuDecimals)),
                'KSU',
              ]}
              usdValue={formatAmount(formatEther(ksuInUSD))}
            />
            <BalanceItem
              title={t('general.availableFunds')}
              toolTipInfo={t('locking.widgets.overview.metric-2-tooltip')}
              value={[
                formatAmount(formatUnits(usdcBalance || '0', usdcDecimals)),
                'USDC',
              ]}
            />
          </Grid>
          <Grid item xs={6}>
            <BalanceItem
              title={t('general.totalKsuLocked')}
              toolTipInfo={t('locking.widgets.overview.metric-3-tooltip')}
              value={[formatAmount(stakedKSU || '0'), 'KSU']}
            />
          </Grid>
        </Grid>
      </ColoredBox>
    </CardWidget>
  )
}

export default BalanceOverview
