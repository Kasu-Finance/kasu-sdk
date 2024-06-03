import {
  DepositModalActions,
  DepositModalActionType,
  DepositModalStateType,
} from '@/context/depositModal/depositModal.types'

const depositModalReducer = (
  state: DepositModalStateType,
  action: DepositModalActions
): DepositModalStateType => {
  switch (action.type) {
    case DepositModalActionType.SET_AMOUNT:
      return {
        ...state,
        amount: action.payload,
      }
    case DepositModalActionType.SET_SELECTED_TRANCHE:
      return {
        ...state,
        trancheId: action.payload,
      }
    case DepositModalActionType.SET_TX_HASH:
      return {
        ...state,
        txHash: action.payload,
      }
    case DepositModalActionType.SET_TERMS_ACCEPTED:
      return { ...state, termsAccepted: action.payload }
    default:
      return state
  }
}

export default depositModalReducer
