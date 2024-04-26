'use client'

import { ReactNode, useReducer } from 'react'

import {
  TransactionStatus,
  TransactionTranches,
  TransactionType,
} from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryFilters'

import TransactionHistoryContext from '@/context/transactionHistory/transactionHistory.context'
import transactionHistoryReducer from '@/context/transactionHistory/transactionHistory.reducer'
import { TransactionHistoryStateType } from '@/context/transactionHistory/transactionHistory.types'

type TransactionHistoryStateProps = {
  children: ReactNode
}

const initialState: TransactionHistoryStateType = {
  status: TransactionStatus.ALL,
  trancheType: TransactionTranches.ALL,
  transactionType: TransactionType.ALL,
}

const TransactionHistoryState: React.FC<TransactionHistoryStateProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(transactionHistoryReducer, initialState)

  return (
    <TransactionHistoryContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TransactionHistoryContext.Provider>
  )
}

export default TransactionHistoryState
