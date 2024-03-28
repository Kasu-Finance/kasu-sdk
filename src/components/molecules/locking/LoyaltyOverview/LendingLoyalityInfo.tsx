'use client'

import { Box, Button, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import useLoyaltyLevel from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'
import useEarnedRKsu from '@/hooks/web3/useEarnedRKsu'
import useLockingPercentage from '@/hooks/web3/useLockingPercentage'

import ColoredBox from '@/components/atoms/ColoredBox'
import InfoRow from '@/components/atoms/InfoRow'
import TokenAmount from '@/components/atoms/TokenAmount'
import ToolTip from '@/components/atoms/ToolTip'
import LoyaltyProgress from '@/components/molecules/locking/LoyaltyOverview/LoyaltyProgress'

import { LockIcon } from '@/assets/icons'

import { capitalize, formatAmount } from '@/utils'

const LendingLoyalityInfo = () => {
  const { t } = useTranslation()
  const { openModal } = useModalState()
  const handleOpenLockingKSU = () => openModal({ name: 'lockModal' })

  const { rKsuAmount } = useEarnedRKsu()
  const stakedPercentage = useLockingPercentage()
  const { currentLevel } = useLoyaltyLevel(stakedPercentage)

  return (
    <>
      <Box display='flex' alignItems='center'>
        <Typography variant='subtitle1' component='h6'>
          {capitalize(t('general.loyaltyLevel'))} {currentLevel}
        </Typography>
        <ToolTip title={t('general.loyaltyLevel')} />
      </Box>

      <LoyaltyProgress stakedPercentage={stakedPercentage} />

      <ColoredBox>
        <InfoRow
          showDivider
          title={`rKSU ${capitalize(t('general.balance'))}`}
          toolTipInfo='info'
          metric={
            <TokenAmount
              amount={formatAmount(rKsuAmount ?? '0', { minDecimals: 2 })}
              symbol='rKSU'
            />
          }
        />

        <InfoRow
          title='rKSU Ratio to Total USDC Deposits'
          toolTipInfo='info'
          metric={
            <Typography variant='h6' component='span'>
              {formatAmount(stakedPercentage, {
                maxDecimals: 2,
              })}
              %
            </Typography>
          }
        />
      </ColoredBox>

      <Button
        onClick={handleOpenLockingKSU}
        variant='contained'
        startIcon={<LockIcon />}
      >
        {t('general.lock')} KSU
      </Button>
    </>
  )
}

export default LendingLoyalityInfo
