import { BigNumber } from 'ethers'

import useLockModalState from '@/hooks/context/useLockModalState'
import useStepperState from '@/hooks/context/useStepperState'
import useToastState from '@/hooks/context/useToastState'
import useUserLocks from '@/hooks/locking/useUserLocks'
import useKasuSDK from '@/hooks/useKasuSDK'
import useEarnedRKsu from '@/hooks/web3/useEarnedRKsu'
import useHandleError from '@/hooks/web3/useHandleError'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { waitForReceipt } from '@/utils'

const useUnlockKSU = () => {
  const sdk = useKasuSDK()

  const handleError = useHandleError()

  const { setTxHash } = useLockModalState()

  const { updateUserLocks } = useUserLocks()

  const { updateEarnedRKsu } = useEarnedRKsu()

  const { setToast, removeToast } = useToastState()

  const { nextStep } = useStepperState()

  return async (unlockAmount: BigNumber, userLockId: BigNumber) => {
    try {
      setToast({
        type: 'info',
        title: ActionStatus.PROCESSING,
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      const lock = await sdk.Locking.unlockKSU(unlockAmount, userLockId)

      const receipt = await waitForReceipt(lock)

      setTxHash(receipt.transactionHash)

      await Promise.all([updateUserLocks(), updateEarnedRKsu()])

      removeToast()

      nextStep()
    } catch (error) {
      handleError(
        error,
        `${ActionType.LOCK} ${ActionStatus.ERROR}`,
        ACTION_MESSAGES[ActionType.UNLOCK][ActionStatus.ERROR]
      )
    }
  }
}

export default useUnlockKSU
