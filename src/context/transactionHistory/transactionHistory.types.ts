import {
  TransactionStatus,
  TransactionTranches,
  TransactionType,
} from '@/components/molecules/lending/overview/TransactionHistory/TransactionHistoryFilters'

import { ValueOf } from '@/types/utils'

export enum TransactionHistoryActionsTypes {
  SET_STATUS = 'SET_STATUS',
  SET_TRANSACTION_TYPE = 'SET_TRANSACTION_TYPE',
  SET_TRANCHE_TYPE = 'SET_TRANCHE_TYPE',
}

export type TransactionHistoryActions =
  | {
      type: TransactionHistoryActionsTypes.SET_STATUS
      payload: ValueOf<typeof TransactionStatus>
    }
  | {
      type: TransactionHistoryActionsTypes.SET_TRANSACTION_TYPE
      payload: ValueOf<typeof TransactionType>
    }
  | {
      type: TransactionHistoryActionsTypes.SET_TRANCHE_TYPE
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
