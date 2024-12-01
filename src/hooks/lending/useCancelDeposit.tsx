import useToastState from '@/hooks/context/useToastState'
import useKasuSDK from '@/hooks/useKasuSDK'
import useHandleError from '@/hooks/web3/useHandleError'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { capitalize, waitForReceipt } from '@/utils'

const useCancelDeposit = () => {
  const sdk = useKasuSDK()

  const handleError = useHandleError()

  const { setToast, removeToast } = useToastState()

  return async (lendingPoolId: `0x${string}`, dNft: string) => {
    try {
      setToast({
        type: 'info',
        title: capitalize(ActionStatus.PROCESSING),
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      const cancel = await sdk.UserLending.cancelDepositRequest(
        lendingPoolId,
        dNft
      )

      const response = await waitForReceipt(cancel)
      removeToast()

      return response
    } catch (error) {
      handleError(
        error,
        `${ActionType.CANCELLATION} ${ActionStatus.ERROR}`,
        ACTION_MESSAGES[ActionType.CANCELLATION][ActionStatus.ERROR]
      )
    }
  }
}

export default useCancelDeposit
