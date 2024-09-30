import useToastState from '@/hooks/context/useToastState'
import useKasuSDK from '@/hooks/useKasuSDK'
import useHandleError from '@/hooks/web3/useHandleError'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { waitForReceipt } from '@/utils'

const useCancelWithdrawal = () => {
  const sdk = useKasuSDK()

  const handleError = useHandleError()

  const { setToast, removeToast } = useToastState()

  return async (lendingPoolId: `0x${string}`, dNft: string) => {
    try {
      setToast({
        type: 'info',
        title: ActionStatus.PROCESSING,
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      const cancel = await sdk.UserLending.cancelWithdrawalRequest(
        lendingPoolId,
        dNft
      )

      await waitForReceipt(cancel)

      removeToast()
    } catch (error) {
      handleError(
        error,
        `${ActionType.CANCELLATION} ${ActionStatus.ERROR}`,
        ACTION_MESSAGES[ActionType.CANCELLATION][ActionStatus.ERROR]
      )
    }
  }
}

export default useCancelWithdrawal
