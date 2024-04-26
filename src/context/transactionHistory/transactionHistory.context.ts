import { createContext } from 'react'

import {
  TransactionHistoryActions,
  TransactionHistoryStateType,
} from '@/context/transactionHistory/transactionHistory.types'

import { ContextWrapper } from '@/types/utils'

const transactionHistoryContext = createContext(
  {} as ContextWrapper<TransactionHistoryStateType, TransactionHistoryActions>
)
transactionHistoryContext.displayName = 'TransactionHistory'

export default transactionHistoryContext
