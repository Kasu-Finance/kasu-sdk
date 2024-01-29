import { Logger } from 'ethers/lib/utils'

import useToastState from '@/hooks/context/useToastState'

import {
  ACTION_MESSAGES,
  ActionStatus,
  ERROR_MESSAGES,
  ErrorTypes,
  TransactionError,
} from '@/constants'
import { userRejectedTransaction } from '@/utils'

const useHandleError = () => {
  const { setToast } = useToastState()

  // refer to https://docs.ethers.org/v5/troubleshooting/errors/
  return (_error: unknown, title?: string, message?: string) => {
    const error = _error as Error

    let txHash: string | undefined = undefined

    if (error instanceof TransactionError) {
      txHash = error.transaction.hash
    }

    switch (true) {
      case userRejectedTransaction(error):
        setToast({
          type: 'error',
          title: title ?? ActionStatus.REJECTED,
          message: message ?? ACTION_MESSAGES[ActionStatus.REJECTED],
        })
        break
      case error.name === Logger.errors.CALL_EXCEPTION:
        setToast({
          type: 'error',
          title: ErrorTypes.TRANSACTION_REVERTED,
          message: ERROR_MESSAGES[ErrorTypes.TRANSACTION_REVERTED],
          txHash,
        })
        break
      case error.name === Logger.errors.INSUFFICIENT_FUNDS:
        setToast({
          type: 'error',
          title: ErrorTypes.INSUFFICIENT_BALANCE,
          message: ERROR_MESSAGES[ErrorTypes.INSUFFICIENT_BALANCE],
        })
        break
      default:
        setToast({
          type: 'error',
          title: title ?? ErrorTypes.UNEXPECTED_ERROR,
          message: message ?? ERROR_MESSAGES[ErrorTypes.UNEXPECTED_ERROR],
        })
        console.error(error)
        break
    }
  }
}

export default useHandleError
