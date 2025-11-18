import { Box, Button } from '@mui/material'
import { parseUnits } from 'ethers/lib/utils'

import useLockModalState from '@/hooks/context/useLockModalState'
import useStepperState from '@/hooks/context/useStepperState'
import useLockKSU from '@/hooks/locking/useLockKSU'
import getTranslation from '@/hooks/useTranslation'
import useApproveToken from '@/hooks/web3/useApproveToken'
import useTokenDetails from '@/hooks/web3/useTokenDetails'

import sdkConfig from '@/config/sdk'

const LockModalReviewActions = () => {
  const { t } = getTranslation()

  const { prevStep } = useStepperState()

  const { amount, selectedLockPeriod } = useLockModalState()

  const { isApproved, approve } = useApproveToken(
    sdkConfig.contracts.KSUToken as `0x${string}`,
    sdkConfig.contracts.IKSULocking as `0x${string}`,
    amount
  )

  const { decimals } = useTokenDetails(
    sdkConfig.contracts.KSUToken as `0x${string}`
  )

  const lockKSU = useLockKSU()

  return (
    <Box display='flex' gap={4}>
      <Button
        variant='outlined'
        color='secondary'
        onClick={prevStep}
        fullWidth
        sx={{ textTransform: 'capitalize' }}
      >
        {t('general.amend')}
      </Button>
      <Button
        variant='contained'
        color='secondary'
        fullWidth
        onClick={() =>
          isApproved
            ? lockKSU(
                parseUnits(amount, decimals),
                selectedLockPeriod.lockPeriod
              )
            : approve(amount)
        }
        sx={{ textTransform: 'capitalize' }}
      >
        {isApproved ? t('general.confirm') : t('general.approve')}
      </Button>
    </Box>
  )
}

export default LockModalReviewActions
