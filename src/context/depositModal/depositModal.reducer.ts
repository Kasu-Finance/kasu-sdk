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
    case 'SET_TERMS_ACCEPTED':
      return { ...state, termsAccepted: action.payload }
    default:
      return state
  }
}

export default depositModalReducer
