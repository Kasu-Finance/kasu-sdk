import {
  FixApyModalActions,
  FixApyModalActionTypes,
  FixApyModalStateType,
} from '@/context/fixApyModal/fixApyModal.types'

const fixApyModalReducer = (
  state: FixApyModalStateType,
  action: FixApyModalActions
): FixApyModalStateType => {
  switch (action.type) {
    case FixApyModalActionTypes.SET_AMOUNT:
      return {
        ...state,
        amount: action.payload,
      }
    case FixApyModalActionTypes.SET_TX_HASH:
      return {
        ...state,
        txHash: action.payload,
      }
    case FixApyModalActionTypes.SET_FIXED_TERM_CONFIG_ID:
      return {
        ...state,
        fixedTermConfigId: action.payload,
      }
  }
}

export default fixApyModalReducer
