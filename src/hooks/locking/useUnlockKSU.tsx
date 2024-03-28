import { BigNumber } from 'ethers'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import useToastState from '@/hooks/context/useToastState'
import useUserLocks from '@/hooks/locking/useUserLocks'
import useKasuSDK from '@/hooks/useKasuSDK'
import useEarnedRKsu from '@/hooks/web3/useEarnedRKsu'
import useHandleError from '@/hooks/web3/useHandleError'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { waitForReceipt } from '@/utils'

const useUnlockKSU = () => {
  const sdk = useKasuSDK()

  const handleError = useHandleError()

  const { updateUserLocks } = useUserLocks()

  const { updateEarnedRKsu } = useEarnedRKsu()

  const { setModalStatusAction } = useModalStatusState()

  const { setToast, removeToast } = useToastState()

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

      await Promise.all([updateUserLocks(), updateEarnedRKsu()])

      setModalStatusAction(ModalStatusAction.COMPLETED)

      removeToast()
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
