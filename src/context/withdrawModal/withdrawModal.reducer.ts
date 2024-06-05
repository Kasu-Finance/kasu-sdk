import {
  WithdrawModalActions,
  WithdrawModalActionTypes,
  WithdrawModalStateType,
} from '@/context/withdrawModal/withdrawModal.types'

const withdrawModalReducer = (
  state: WithdrawModalStateType,
  action: WithdrawModalActions
): WithdrawModalStateType => {
  switch (action.type) {
    case WithdrawModalActionTypes.SET_AMOUNT:
      return {
        ...state,
        amount: action.payload,
      }
    case WithdrawModalActionTypes.SET_SELECTED_TRANCHE:
      return {
        ...state,
        selectedTranche: action.payload,
      }
  }
}

export default withdrawModalReducer
