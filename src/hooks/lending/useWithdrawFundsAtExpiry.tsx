import useSdk from '@/hooks/context/useSdk'
import useStepperState from '@/hooks/context/useStepperState'
import useToastState from '@/hooks/context/useToastState'
import useHandleError from '@/hooks/web3/useHandleError'

import { KasuSdkNotReadyError } from '@/context/sdk/sdk.types'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { capitalize, waitForReceipt } from '@/utils'

const useWithdrawFundsAtExpiry = () => {
  const sdk = useSdk()

  const { setToast, removeToast } = useToastState()

  const { nextStep } = useStepperState()

  const handleError = useHandleError()

  return async (lendingPool: string, lockId: string) => {
    try {
      if (!sdk) {
        throw new KasuSdkNotReadyError()
      }

      setToast({
        type: 'info',
        title: capitalize(ActionStatus.PROCESSING),
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      const withdrawAtExpiry = await sdk.UserLending.withdrawAtExpiry(
        lendingPool,
        lockId
      )

      await waitForReceipt(withdrawAtExpiry)

      removeToast()

      nextStep()
    } catch (error) {
      handleError(
        error,
        capitalize(`${ActionType.WITHDRAW_AT_EXPIRY} ${ActionStatus.ERROR}`),
        ACTION_MESSAGES[ActionType.WITHDRAW_AT_EXPIRY][ActionStatus.ERROR]
      )
    }
  }
}

export default useWithdrawFundsAtExpiry
