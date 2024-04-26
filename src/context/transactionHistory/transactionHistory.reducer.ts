import {
  TransactionHistoryActions,
  TransactionHistoryStateType,
} from '@/context/transactionHistory/transactionHistory.types'

const transactionHistoryReducer = (
  state: TransactionHistoryStateType,
  action: TransactionHistoryActions
): TransactionHistoryStateType => {
  switch (action.type) {
    case 'SET_STATUS':
      return {
        ...state,
        status: action.payload,
      }
    case 'SET_TRANSACTION_TYPE':
      return {
        ...state,
        transactionType: action.payload,
      }
    case 'SET_TRANCHE_TYPE':
      return {
        ...state,
        trancheType: action.payload,
      }
  }
}

export default transactionHistoryReducer
