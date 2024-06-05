import { createContext } from 'react'

import { TransactionHistoryTypes } from '@/context/transactionHistory/transactionHistory.types'

const transactionHistoryContext = createContext({} as TransactionHistoryTypes)
transactionHistoryContext.displayName = 'TransactionHistory'

export default transactionHistoryContext
