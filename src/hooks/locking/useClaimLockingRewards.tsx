import useSdk from '@/hooks/context/useSdk'
import useToastState from '@/hooks/context/useToastState'
import useLockingRewards from '@/hooks/locking/useLockingRewards'
import useHandleError from '@/hooks/web3/useHandleError'

import { KasuSdkNotReadyError } from '@/context/sdk/sdk.types'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { waitForReceipt } from '@/utils'

const useClaimLockingRewards = () => {
  const sdk = useSdk()

  const handleError = useHandleError()

  const { updateLockingRewards } = useLockingRewards()

  const { setToast } = useToastState()

  return async () => {
    try {
      if (!sdk) {
        throw new KasuSdkNotReadyError()
      }

      setToast({
        type: 'info',
        title: ActionStatus.PROCESSING,
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      const claim = await sdk.Locking.claimFees()

      const receipt = await waitForReceipt(claim)

      await updateLockingRewards()

      setToast({
        type: 'success',
        title: `${ActionType.CLAIM_REWARDS} ${ActionStatus.SUCCESS}`,
        message:
          ACTION_MESSAGES[ActionType.CLAIM_REWARDS][ActionStatus.SUCCESS],
        txHash: receipt.transactionHash,
      })
    } catch (error) {
      handleError(
        error,
        `${ActionType.CLAIM_REWARDS} ${ActionStatus.ERROR}`,
        ACTION_MESSAGES[ActionType.CLAIM_REWARDS][ActionStatus.ERROR]
      )
    }
  }
}

export default useClaimLockingRewards
