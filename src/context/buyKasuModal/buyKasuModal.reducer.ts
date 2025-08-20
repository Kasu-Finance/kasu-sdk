import {
  BuyKasuModalActions,
  BuyKasuModalActionType,
  BuyKasuModalStateType,
} from '@/context/buyKasuModal/buyKasuModal.types'

const buyKasuModalReducer = (
  state: BuyKasuModalStateType,
  action: BuyKasuModalActions
): BuyKasuModalStateType => {
  switch (action.type) {
    case BuyKasuModalActionType.SET_SELECTED_TOKEN:
      return {
        ...state,
        selectedToken: action.payload,
      }
    case BuyKasuModalActionType.SET_AMOUNT:
      return {
        ...state,
        amount: action.payload,
      }
    case BuyKasuModalActionType.SET_AMOUNT_IN_USD:
      return {
        ...state,
        amountInUSD: action.payload,
      }
    case BuyKasuModalActionType.TOGGLE_SWAP_AND_LOCK:
      return {
        ...state,
        swapAndLock: !state.swapAndLock,
      }
    case BuyKasuModalActionType.SET_IS_VALIDATING:
      return {
        ...state,
        isValidating: action.payload,
      }
    case BuyKasuModalActionType.SET_IS_DEBOUNCING:
      return {
        ...state,
        isDebouncing: action.payload,
      }
    case BuyKasuModalActionType.SET_SELECTED_LOCK_PERIOD:
      return {
        ...state,
        selectedLockPeriod: action.payload,
      }
  }
}

export default buyKasuModalReducer
