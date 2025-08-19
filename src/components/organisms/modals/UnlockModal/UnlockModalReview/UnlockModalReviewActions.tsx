import { Box, Button } from '@mui/material'
import { parseUnits } from 'ethers/lib/utils'

import useStepperState from '@/hooks/context/useStepperState'
import useUnlockModalState from '@/hooks/context/useUnlockModalState'
import useUnlockKSU from '@/hooks/locking/useUnlockKSU'
import getTranslation from '@/hooks/useTranslation'
import useTokenDetails from '@/hooks/web3/useTokenDetails'

import sdkConfig from '@/config/sdk'

const UnlockModalReviewActions = () => {
  const { t } = getTranslation()

  const { prevStep } = useStepperState()

  const { amount, userLock } = useUnlockModalState()

  const { decimals } = useTokenDetails(
    sdkConfig.contracts.KSUToken as `0x${string}`
  )

  const unlockKSU = useUnlockKSU()

  return (
    <Box display='flex' gap={4}>
      <Button
        variant='outlined'
        color='secondary'
        onClick={prevStep}
        fullWidth
        sx={{ textTransform: 'capitalize' }}
      >
        {t('general.adjust')}
      </Button>
      <Button
        variant='contained'
        color='secondary'
        fullWidth
        onClick={() => unlockKSU(parseUnits(amount, decimals), userLock.id)}
        sx={{ textTransform: 'capitalize' }}
      >
        {t('general.confirm')}
      </Button>
    </Box>
  )
}

export default UnlockModalReviewActions
