'use client'

import { Button } from '@mui/material'

import useClaimLockingRewards from '@/hooks/locking/useClaimLockingRewards'
import useUserBonusData from '@/hooks/locking/useUserBonusData'
import getTranslation from '@/hooks/useTranslation'

import { toBigNumber } from '@/utils'

const ClaimFeesButton = () => {
  const { t } = getTranslation()

  const claimRewards = useClaimLockingRewards()

  const { userBonus } = useUserBonusData()

  const isFeesClaimable = Boolean(
    userBonus && !toBigNumber(userBonus.protocolFeesEarned).isZero()
  )

  return (
    <Button
      variant='outlined'
      fullWidth
      sx={{ maxWidth: 368, textTransform: 'capitalize', mt: 'auto' }}
      onClick={claimRewards}
      disabled={!isFeesClaimable}
    >
      {t('general.claim')} USDC
    </Button>
  )
}

export default ClaimFeesButton
