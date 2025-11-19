import {
  UnlockModalActions,
  UnlockModalActionType,
  UnlockModalStateType,
} from '@/context/unlockModal/unlockModal.types'

const unlockModalReducer = (
  state: UnlockModalStateType,
  action: UnlockModalActions
): UnlockModalStateType => {
  switch (action.type) {
    case UnlockModalActionType.SET_USER_LOCK:
      return {
        ...state,
        userLock: action.payload,
      }
    case UnlockModalActionType.SET_AMOUNT:
      return {
        ...state,
        amount: action.payload,
      }
    case UnlockModalActionType.SET_TX_HASH:
      return {
        ...state,
        txHash: action.payload,
      }
    default:
      return state
  }
}

export default unlockModalReducer
