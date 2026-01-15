import { useSWRConfig } from 'swr'

import useSdk from '@/hooks/context/useSdk'
import useToastState from '@/hooks/context/useToastState'
import useHandleError from '@/hooks/web3/useHandleError'

import { KasuSdkNotReadyError } from '@/context/sdk/sdk.types'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { capitalize, waitForReceipt } from '@/utils'

const useCancelDeposit = () => {
  const sdk = useSdk()

  const handleError = useHandleError()

  const { setToast, removeToast } = useToastState()

  const { mutate } = useSWRConfig()

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

      const cancel = await sdk.UserLending.cancelDepositRequest(
        lendingPoolId,
        dNft
      )

      const response = await waitForReceipt(cancel)
      removeToast()

      void mutate(
        (key) => Array.isArray(key) && key[0] === 'transactionHistory',
        undefined,
        { revalidate: true }
      )

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
