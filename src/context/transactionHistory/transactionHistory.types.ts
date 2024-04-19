import {
  TransactionStatus,
  TransactionTranches,
  TransactionType,
} from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryFilters'

import { ValueOf } from '@/types/utils'

export type TransactionHistoryActions =
  | {
      type: 'SET_STATUS'
      payload: ValueOf<typeof TransactionStatus>
    }
  | {
      type: 'SET_TRANSACTION_TYPE'
      payload: ValueOf<typeof TransactionType>
    }
  | {
      type: 'SET_TRANCHE_TYPE'
      payload: ValueOf<typeof TransactionTranches>
    }

export type TransactionHistoryStateType = {
  status: ValueOf<typeof TransactionStatus>
  transactionType: ValueOf<typeof TransactionType>
  trancheType: ValueOf<typeof TransactionTranches>
}

export type TransactionHistoryFunctions = {
  setStatus: (status: ValueOf<typeof TransactionStatus>) => void
  setTransactionType: (transactionType: ValueOf<typeof TransactionType>) => void
  setTrancheType: (trancheType: ValueOf<typeof TransactionTranches>) => void
}

export type TransactionHistoryTypes = TransactionHistoryStateType &
  TransactionHistoryFunctions
