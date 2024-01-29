import { BigNumber } from 'ethers'

import useKasuSDK from '@/hooks/useKasuSDK'
import useHandleError from '@/hooks/web3/useHandleError'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import useToastState from '@/context/toast/useToastState'
import { waitForReceipt } from '@/utils'

const useLockToken = () => {
  const sdk = useKasuSDK()

  const handleError = useHandleError()

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

      const receipt = await waitForReceipt(lock)

      setToast({
        type: 'success',
        title: `${ActionType.LOCK} ${ActionStatus.SUCCESS}`,
        message: ACTION_MESSAGES[ActionType.LOCK][ActionStatus.SUCCESS],
        txHash: receipt.transactionHash,
      })
    } catch (error) {
      handleError(
        error,
        `${ActionType.LOCK} ${ActionStatus.ERROR}`,
        ACTION_MESSAGES[ActionType.LOCK][ActionStatus.ERROR]
      )
    }
  }
}

export default useLockToken
