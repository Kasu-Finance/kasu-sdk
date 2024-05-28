import {
  DepositModalActions,
  DepositModalStateType,
} from '@/context/depositModal/depositModal.types'

const depositModalReducer = (
  state: DepositModalStateType,
  action: DepositModalActions
): DepositModalStateType => {
  switch (action.type) {
    case 'SET_AMOUNT':
      return {
        ...state,
        amount: action.payload,
        amountInUSD: undefined,
      }
    case 'SET_AMOUNT_IN_USD':
      return {
        ...state,
        amountInUSD: action.payload,
      }
    case 'SET_SELECTED_TRANCHE':
      return {
        ...state,
        trancheId: action.payload,
      }
    case 'SET_TX_HASH':
      return {
        ...state,
        txHash: action.payload,
      }
    case 'SET_SIMULATED_DURATION':
      return {
        ...state,
        simulatedDuration: action.payload,
      }
    default:
      return state
  }
}

export default depositModalReducer
