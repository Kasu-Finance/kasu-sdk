import { Logger } from 'ethers/lib/utils'
import { useAccount, useChainId } from 'wagmi'

import useToastState from '@/hooks/context/useToastState'

import { KasuSdkNotReadyError } from '@/context/sdk/sdk.types'

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
      // early return statements
      case userRejectedTransaction(error):
        setToast({
          type: 'error',
          title: capitalize(ActionStatus.REJECTED),
          message: ACTION_MESSAGES[ActionStatus.REJECTED],
        })
        return
      case error.name === Logger.errors.INSUFFICIENT_FUNDS:
        setToast({
          type: 'error',
          title: capitalize(ErrorTypes.INSUFFICIENT_BALANCE),
          message: ERROR_MESSAGES[ErrorTypes.INSUFFICIENT_BALANCE],
        })
        return
      // break to enable logging
      case overrideDefault:
        setToast({
          type: 'error',
          title: capitalize(title ?? ErrorTypes.UNEXPECTED_ERROR),
          message: message ?? ERROR_MESSAGES[ErrorTypes.UNEXPECTED_ERROR],
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
      default:
        setToast({
          type: 'error',
          title: capitalize(title ?? ErrorTypes.UNEXPECTED_ERROR),
          message: message ?? ERROR_MESSAGES[ErrorTypes.UNEXPECTED_ERROR],
        })
        console.error(error)
        break
    }

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
  }
}

export default useHandleError
