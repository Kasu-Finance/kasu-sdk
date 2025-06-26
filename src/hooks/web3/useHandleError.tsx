import { Logger } from 'ethers/lib/utils'
import { useAccount, useChainId } from 'wagmi'

import useToastState from '@/hooks/context/useToastState'
import { KasuSdkNotReadyError } from '@/hooks/useKasuSDK'

import {
  ACTION_MESSAGES,
  ActionStatus,
  ERROR_MESSAGES,
  ErrorTypes,
  TransactionError,
} from '@/constants'
import { capitalize, userRejectedTransaction } from '@/utils'

const useHandleError = () => {
  const { setToast } = useToastState()

  const { address } = useAccount()

  const chainId = useChainId()

  // refer to https://docs.ethers.org/v5/troubleshooting/errors/
  return (
    _error: unknown,
    title?: string,
    message?: string,
    overrideDefault?: boolean
  ) => {
    const error = _error as Error

    let txHash: string | undefined = undefined

    if (error instanceof KasuSdkNotReadyError) {
      console.error(error.message)
      return
    }

    if (error instanceof TransactionError) {
      txHash = error.transaction.hash
    }

    switch (true) {
      case overrideDefault:
        setToast({
          type: 'error',
          title: capitalize(title ?? ErrorTypes.UNEXPECTED_ERROR),
          message: message ?? ERROR_MESSAGES[ErrorTypes.UNEXPECTED_ERROR],
        })
        return
      case userRejectedTransaction(error):
        setToast({
          type: 'error',
          title: capitalize(ActionStatus.REJECTED),
          message: ACTION_MESSAGES[ActionStatus.REJECTED],
        })
        break
      case error.name === Logger.errors.CALL_EXCEPTION:
        setToast({
          type: 'error',
          title: capitalize(ErrorTypes.TRANSACTION_REVERTED),
          message: ERROR_MESSAGES[ErrorTypes.TRANSACTION_REVERTED],
          txHash,
        })
        break
      case error.name === Logger.errors.INSUFFICIENT_FUNDS:
        setToast({
          type: 'error',
          title: capitalize(ErrorTypes.INSUFFICIENT_BALANCE),
          message: ERROR_MESSAGES[ErrorTypes.INSUFFICIENT_BALANCE],
        })
        break
      default:
        setToast({
          type: 'error',
          title: capitalize(title ?? ErrorTypes.UNEXPECTED_ERROR),
          message: message ?? ERROR_MESSAGES[ErrorTypes.UNEXPECTED_ERROR],
        })

        fetch('/api/logging', {
          body: JSON.stringify({
            error: {
              message: error.message,
              cause: error.cause,
              name: error.name,
              stack: error.stack,
            },
            chainId,
            address,
            title,
            message,
          }),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          method: 'POST',
        })
        console.error(error)
        break
    }
  }
}

export default useHandleError
