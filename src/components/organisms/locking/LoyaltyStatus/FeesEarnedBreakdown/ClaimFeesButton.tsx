'use client'

import { Button } from '@mui/material'

import useClaimLockingRewards from '@/hooks/locking/useClaimLockingRewards'
import useLockingRewards from '@/hooks/locking/useLockingRewards'
import getTranslation from '@/hooks/useTranslation'

import { toBigNumber } from '@/utils'

const ClaimFeesButton = () => {
  const { t } = getTranslation()

  const claimRewards = useClaimLockingRewards()

  const { lockingRewards } = useLockingRewards()

  const isFeesClaimable = Boolean(
    lockingRewards && !toBigNumber(lockingRewards.claimableRewards, 6).isZero()
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
