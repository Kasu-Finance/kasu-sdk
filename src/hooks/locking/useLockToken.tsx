import { BigNumber } from 'ethers'

import useKasuSDK from '@/hooks/useKasuSDK'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import useToastState from '@/context/toast/useToastState'

const useLockToken = () => {
  const sdk = useKasuSDK()

  const { setToast } = useToastState()

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

      const receipt = await lock.wait()

      setToast({
        type: 'success',
        title: `${ActionType.LOCK} ${ActionStatus.SUCCESS}`,
        message: ACTION_MESSAGES[ActionType.LOCK][ActionStatus.SUCCESS],
        txHash: receipt.transactionHash,
      })
    } catch (error) {
      // Logger.errors.CALL_EXCEPTION
      setToast({
        type: 'error',
        title: `${ActionType.LOCK} ${ActionStatus.ERROR}`,
        message: ACTION_MESSAGES[ActionType.LOCK][ActionStatus.ERROR],
        txHash: 'https://www.google.com',
      })
    }
  }
}

export default useLockToken
