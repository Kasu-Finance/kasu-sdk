import { useCallback, useContext } from 'react'

import {
  TransactionStatus,
  TransactionTranches,
  TransactionType,
} from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryFilters'

import transactionHistoryContext from '@/context/transactionHistory/transactionHistory.context'
import { TransactionHistoryTypes } from '@/context/transactionHistory/transactionHistory.types'

import { ValueOf } from '@/types/utils'

const useTransactionHistoryState = (): TransactionHistoryTypes => {
  const context = useContext(transactionHistoryContext)

  if (!Object.keys(context).length) {
    throw new Error(
      'TransactionHistoryContext must be used within its provider'
    )
  }

  const { dispatch } = context

  const setStatus = useCallback(
    (status: ValueOf<typeof TransactionStatus>) =>
      dispatch({
        type: 'SET_STATUS',
        payload: status,
      }),
    [dispatch]
  )

  const setTransactionType = useCallback(
    (tranasctionType: ValueOf<typeof TransactionType>) =>
      dispatch({
        type: 'SET_TRANSACTION_TYPE',
        payload: tranasctionType,
      }),
    [dispatch]
  )

  const setTrancheType = useCallback(
    (trancheType: ValueOf<typeof TransactionTranches>) =>
      dispatch({
        type: 'SET_TRANCHE_TYPE',
        payload: trancheType,
      }),
    [dispatch]
  )

  return {
    ...context,
    setStatus,
    setTrancheType,
    setTransactionType,
  }
}

export default useTransactionHistoryState
