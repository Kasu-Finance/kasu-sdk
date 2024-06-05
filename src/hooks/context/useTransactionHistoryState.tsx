import { useContext } from 'react'

import transactionHistoryContext from '@/context/transactionHistory/transactionHistory.context'
import { TransactionHistoryTypes } from '@/context/transactionHistory/transactionHistory.types'

const useTransactionHistoryState = (): TransactionHistoryTypes => {
  const context = useContext(transactionHistoryContext)

  if (!Object.keys(context).length) {
    throw new Error(
      'TransactionHistoryContext must be used within its provider'
    )
  }

  return context
}

export default useTransactionHistoryState
