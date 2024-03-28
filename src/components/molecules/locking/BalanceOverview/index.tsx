'use client'

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

import { TimedLockIcon, WalletIcon } from '@/assets/icons'

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
            startIcon={<WalletIcon />}
          >
            {t('general.buy')} KSU
          </Button>
          <Button
            sx={{ wixth: 143 }}
            variant='contained'
            onClick={handleOpen}
            startIcon={<TimedLockIcon />}
          >
            {t('general.lock')} KSU
          </Button>
        </>
      }
    >
      <ColoredBox>
        <Grid container spacing={2}>
          <Grid item container xs={6}>
            <BalanceItem
              title={`${t('general.wallet')} ${t('general.balance')}`}
              toolTipInfo='info'
              value={[
                formatAmount(formatUnits(ksuBalance || '0', ksuDecimals), {
                  minDecimals: 2,
                }),
                'KSU',
              ]}
              usdValue={formatAmount(formatEther(ksuInUSD), { minDecimals: 2 })}
            />
            <BalanceItem
              title='Available Funds'
              toolTipInfo='info'
              value={[
                formatAmount(formatUnits(usdcBalance || '0', usdcDecimals), {
                  minDecimals: 2,
                }),
                'USDC',
              ]}
            />
          </Grid>
          <Grid item xs={6}>
            <BalanceItem
              title='Total KSU Locked'
              toolTipInfo='info'
              value={[
                formatAmount(stakedKSU || '0', { minDecimals: 2 }),
                'KSU',
              ]}
            />
          </Grid>
        </Grid>
      </ColoredBox>
    </CardWidget>
  )
}

export default BalanceOverview
