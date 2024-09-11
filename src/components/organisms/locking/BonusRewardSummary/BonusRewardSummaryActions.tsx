'use client'

import { Button, Grid } from '@mui/material'

import useClaimLockingRewards from '@/hooks/locking/useClaimLockingRewards'
import useUserBonusData from '@/hooks/locking/useUserBonusData'
import useTranslation from '@/hooks/useTranslation'

import { toBigNumber } from '@/utils'

const BonusRewardSummaryActions = () => {
  const { t } = useTranslation()

  const claimRewards = useClaimLockingRewards()

  const { userBonus } = useUserBonusData()

  const isFeesClaimable = Boolean(
    userBonus && !toBigNumber(userBonus.protocolFeesEarned).isZero()
  )

  return (
    <>
      <Grid item xs={6} textAlign='right'>
        <Button
          variant='outlined'
          fullWidth
          sx={{ maxWidth: 368, textTransform: 'capitalize' }}
          onClick={claimRewards}
          disabled={!isFeesClaimable}
        >
          {t('general.claim')} USDC
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          variant='outlined'
          fullWidth
          sx={{ maxWidth: 368, textTransform: 'capitalize' }}
          disabled
        >
          {t('general.claim')} KSU
        </Button>
      </Grid>
    </>
  )
}

export default BonusRewardSummaryActions
