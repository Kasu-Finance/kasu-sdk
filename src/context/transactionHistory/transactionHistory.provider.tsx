'use client'

import { ReactNode, useReducer } from 'react'

import {
  TransactionStatus,
  TransactionTranches,
  TransactionType,
} from '@/components/organisms/lending/OverviewTab/UserTransactions/TransactionFilters'

import useTransactionHistoryActions from '@/context/transactionHistory/transactionHistory.actions'
import TransactionHistoryContext from '@/context/transactionHistory/transactionHistory.context'
import transactionHistoryReducer from '@/context/transactionHistory/transactionHistory.reducer'
import { TransactionHistoryStateType } from '@/context/transactionHistory/transactionHistory.types'

type TransactionHistoryStateProps = {
  children: ReactNode
  withPoolIdFilter?: boolean
  withPendingDecisions?: boolean
}

const initialState: TransactionHistoryStateType = {
  status: TransactionStatus.ALL,
  trancheType: TransactionTranches.ALL,
  transactionType: TransactionType.ALL,
}

const TransactionHistoryState: React.FC<TransactionHistoryStateProps> = ({
  children,
  withPoolIdFilter,
  withPendingDecisions,
}) => {
  const [state, dispatch] = useReducer(transactionHistoryReducer, {
    ...initialState,
    poolId: withPoolIdFilter ? 'All' : undefined,
    pendingDecision: withPendingDecisions ? 'All' : undefined,
  })

  const transactionHistoryActions = useTransactionHistoryActions(dispatch)

  return (
    <TransactionHistoryContext.Provider
      value={{ ...state, ...transactionHistoryActions }}
    >
      {children}
    </TransactionHistoryContext.Provider>
  )
}

export default TransactionHistoryState
