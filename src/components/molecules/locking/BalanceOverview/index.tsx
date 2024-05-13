'use client'

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import LockClockIcon from '@mui/icons-material/LockClock'
import { Button, Grid } from '@mui/material'
import { formatEther, formatUnits, parseEther } from 'ethers/lib/utils'

import useModalState from '@/hooks/context/useModalState'
import useStakedKSU from '@/hooks/locking/useStakedKSU'
import useTranslation from '@/hooks/useTranslation'
import useKsuPrice from '@/hooks/web3/useKsuPrice'
import useUserBalance from '@/hooks/web3/useUserBalance'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import sdkConfig, { USDC } from '@/config/sdk'
import { convertToUSD, formatAmount } from '@/utils'

const BalanceOverview = () => {
  const { openModal } = useModalState()
  const { t } = useTranslation()

  const handleOpen = () => openModal({ name: 'lockModal' })

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
          <Button
            variant='contained'
            sx={{ width: 134 }}
            href='https://www.google.com'
            target='_blank'
            startIcon={<AccountBalanceWalletIcon />}
          >
            {t('general.buyKSU')}
          </Button>
          <Button
            sx={{ wixth: 143 }}
            variant='contained'
            onClick={handleOpen}
            startIcon={<LockClockIcon />}
          >
            {t('general.lockKSU')}
          </Button>
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
              value={[formatAmount(stakedKSU), 'KSU']}
            />
          </Grid>
        </Grid>
      </ColoredBox>
    </CardWidget>
  )
}

export default BalanceOverview
