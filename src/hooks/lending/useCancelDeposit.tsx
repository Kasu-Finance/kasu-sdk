import useToastState from '@/hooks/context/useToastState'
import useKasuSDK from '@/hooks/useKasuSDK'
import useHandleError from '@/hooks/web3/useHandleError'

import { ACTION_MESSAGES, ActionStatus } from '@/constants'
import { waitForReceipt } from '@/utils'

const useCancelDeposit = () => {
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

      const cancel = await sdk.UserLending.cancelDepositRequest(
        lendingPoolId,
        dNft
      )

      await waitForReceipt(cancel)

      removeToast()
    } catch (error) {
      handleError(error)
    }
  }
}

export default useCancelDeposit
