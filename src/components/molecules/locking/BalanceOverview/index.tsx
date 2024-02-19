'use client'

import { Button, Grid } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'

import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'
import useUserBalance from '@/hooks/web3/useUserBalance'

import CardWidget from '@/components/atoms/CardWidget'
import ColoredBox from '@/components/atoms/ColoredBox'
import BalanceItem from '@/components/molecules/locking/BalanceOverview/BalanceItem'

import { LockIcon, WalletIcon } from '@/assets/icons'

import sdkConfig from '@/config/sdk'

const BalanceOverview = () => {
  const { openModal } = useModalState()
  const { t } = useTranslation()
  const handleOpen = () => openModal({ name: 'lockModal' })

  const { balance, symbol, decimals } = useUserBalance(
    sdkConfig.contracts.KSUToken
  )

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
            startIcon={<LockIcon />}
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
              value={[formatUnits(balance || '0', decimals), symbol ?? 'KSU']}
              subValue={[
                formatUnits('100000000000000000000000', decimals),
                'USDC',
              ]}
            />
            <BalanceItem
              title='Available Funds'
              toolTipInfo='info'
              value={[
                formatUnits('100000000000000000000000', decimals),
                'USDC',
              ]}
            />
          </Grid>
          <Grid item xs={6}>
            <BalanceItem
              title='Total KSU Locked'
              toolTipInfo='info'
              value={['100,000.00', 'KSU']}
            />
          </Grid>
        </Grid>
      </ColoredBox>
    </CardWidget>
  )
}

export default BalanceOverview
