import {
  TransactionHistoryActions,
  TransactionHistoryActionsTypes,
  TransactionHistoryStateType,
} from '@/context/transactionHistory/transactionHistory.types'

const transactionHistoryReducer = (
  state: TransactionHistoryStateType,
  action: TransactionHistoryActions
): TransactionHistoryStateType => {
  switch (action.type) {
    case TransactionHistoryActionsTypes.SET_STATUS:
      return {
        ...state,
        status: action.payload,
      }
    case TransactionHistoryActionsTypes.SET_TRANSACTION_TYPE:
      return {
        ...state,
        transactionType: action.payload,
      }
    case TransactionHistoryActionsTypes.SET_TRANCHE_TYPE:
      return {
        ...state,
        trancheType: action.payload,
      }
    case TransactionHistoryActionsTypes.SET_POOL_ID:
      return {
        ...state,
        poolId: action.payload,
      }
    case TransactionHistoryActionsTypes.SET_PENDING_DECISIONS:
      return {
        ...state,
        pendingDecision: action.payload,
      }
  }
}

export default transactionHistoryReducer
