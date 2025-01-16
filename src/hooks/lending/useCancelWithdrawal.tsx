import useToastState from '@/hooks/context/useToastState'
import useKasuSDK, { KasuSdkNotReadyError } from '@/hooks/useKasuSDK'
import useHandleError from '@/hooks/web3/useHandleError'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { capitalize, waitForReceipt } from '@/utils'

const useCancelWithdrawal = () => {
  const sdk = useKasuSDK()

  const handleError = useHandleError()

  const { setToast, removeToast } = useToastState()

  return async (lendingPoolId: `0x${string}`, dNft: string) => {
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

      const cancel = await sdk.UserLending.cancelWithdrawalRequest(
        lendingPoolId,
        dNft
      )

      const response = await waitForReceipt(cancel)

      removeToast()

      return response
    } catch (error) {
      handleError(
        error,
        capitalize(`${ActionType.CANCELLATION} ${ActionStatus.ERROR}`),
        ACTION_MESSAGES[ActionType.CANCELLATION][ActionStatus.ERROR]
      )
    }
  }
}

export default useCancelWithdrawal
