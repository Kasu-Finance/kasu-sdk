import { BigNumber } from 'ethers'

import useLockModalState from '@/hooks/context/useLockModalState'
import useStepperState from '@/hooks/context/useStepperState'
import useToastState from '@/hooks/context/useToastState'
import useEarnedBonusLockingAmount from '@/hooks/locking/useEarnedBonusLockingAmount'
import useUserLocks from '@/hooks/locking/useUserLocks'
import useKasuSDK from '@/hooks/useKasuSDK'
import useEarnedRKsu from '@/hooks/web3/useEarnedRKsu'
import useHandleError from '@/hooks/web3/useHandleError'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { waitForReceipt } from '@/utils'

const useLockKSU = () => {
  const sdk = useKasuSDK()
  const handleError = useHandleError()

  const { setTxHash } = useLockModalState()
  const { updateUserLocks } = useUserLocks()
  const { updateEarnedRKsu } = useEarnedRKsu()
  const { updateEarnedBonusLockingAmount } = useEarnedBonusLockingAmount()
  const { setToast, removeToast } = useToastState()
  const { nextStep } = useStepperState()

  return async (amount: BigNumber, duration: string) => {
    try {
      setToast({
        type: 'info',
        title: ActionStatus.PROCESSING,
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      const lock = await sdk.Locking.lockKSUTokens(
        amount,
        BigNumber.from(duration)
      )

      const receipt = await waitForReceipt(lock)

      setTxHash(receipt.transactionHash)

      await Promise.all([
        updateUserLocks(),
        updateEarnedRKsu(),
        updateEarnedBonusLockingAmount(),
      ])

      removeToast()

      nextStep()
    } catch (error) {
      handleError(
        error,
        `${ActionType.LOCK} ${ActionStatus.ERROR}`,
        ACTION_MESSAGES[ActionType.LOCK][ActionStatus.ERROR]
      )
    }
  }
}

export default useLockKSU
