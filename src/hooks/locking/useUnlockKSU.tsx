import { BigNumber } from 'ethers'

import useLockModalState from '@/hooks/context/useLockModalState'
import useToastState from '@/hooks/context/useToastState'
import useKasuSDK from '@/hooks/useKasuSDK'
import useHandleError from '@/hooks/web3/useHandleError'

import { LockProgress } from '@/context/lockModal/lockModal.types'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { waitForReceipt } from '@/utils'

const useUnlockKSU = () => {
  const sdk = useKasuSDK()

  const handleError = useHandleError()

  const { setLockProgress } = useLockModalState()

  const { setToast } = useToastState()

  return async (unlockAmount: BigNumber, userLockId: BigNumber) => {
    try {
      setToast({
        type: 'info',
        title: ActionStatus.PROCESSING,
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      const lock = await sdk.Locking.unlockKSU(unlockAmount, userLockId)

      await waitForReceipt(lock)

      setLockProgress(LockProgress.COMPLETED)
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
