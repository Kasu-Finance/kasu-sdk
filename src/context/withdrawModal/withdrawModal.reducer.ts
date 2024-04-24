import {
  WithdrawActionTypes,
  WithdrawModalActions,
  WithdrawModalStateType,
} from '@/context/withdrawModal/withdrawModal.types'

const withdrawModalReducer = (
  state: WithdrawModalStateType,
  action: WithdrawModalActions
): WithdrawModalStateType => {
  switch (action.type) {
    case WithdrawActionTypes.SET_AMOUNT:
      return {
        ...state,
        amount: action.payload,
      }
    case WithdrawActionTypes.SET_SELECTED_TRANCHE:
      return {
        ...state,
        selectedTranche: action.payload,
      }
    default:
      return state
  }
}

export default withdrawModalReducer
