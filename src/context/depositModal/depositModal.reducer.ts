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
        amountInUSD: undefined,
      }
    case DepositModalActionType.SET_AMOUNT_IN_USD:
      return {
        ...state,
        amountInUSD: action.payload,
      }
    case DepositModalActionType.SET_SELECTED_TRANCHE:
      return {
        ...state,
        trancheId: action.payload,
        amount: '',
        amountInUSD: undefined,
      }
    case DepositModalActionType.SET_TX_HASH:
      return {
        ...state,
        txHash: action.payload,
      }
    case DepositModalActionType.SET_SIMULATED_DURATION:
      return {
        ...state,
        simulatedDuration: action.payload,
      }
    case DepositModalActionType.SET_SELECTED_TOKEN:
      return {
        ...state,
        selectedToken: action.payload,
        amount: '',
        amountInUSD: undefined,
      }
    case DepositModalActionType.SET_IS_VALIDATING:
      return {
        ...state,
        isValidating: action.payload,
      }
    case DepositModalActionType.SET_TERMS_ACCEPTED:
      return { ...state, termsAccepted: action.payload }
  }
}

export default depositModalReducer
