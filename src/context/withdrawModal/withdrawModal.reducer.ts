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
    case WithdrawModalActionTypes.SET_SELECTED_POOL:
      return {
        ...state,
        selectedPool: action.payload,
      }
    case WithdrawModalActionTypes.SET_AMOUNT:
      return {
        ...state,
        amount: action.payload,
      }
    case WithdrawModalActionTypes.SET_TX_HASH:
      return {
        ...state,
        txHash: action.payload,
      }
    case WithdrawModalActionTypes.SET_SELECTED_TRANCHE:
      return {
        ...state,
        trancheId: action.payload,
        amount: '',
      }
  }
}

export default withdrawModalReducer
