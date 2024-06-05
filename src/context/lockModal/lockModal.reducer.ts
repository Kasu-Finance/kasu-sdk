import {
  LockModalActions,
  LockModalActionType,
  LockModalStateType,
} from '@/context/lockModal/lockModal.types'

const lockModalReducer = (
  state: LockModalStateType,
  action: LockModalActions
): LockModalStateType => {
  switch (action.type) {
    case LockModalActionType.SET_AMOUNT:
      return {
        ...state,
        amount: action.payload,
      }
    case LockModalActionType.SET_SELECTED_LOCK_PERIOD:
      return {
        ...state,
        selectedLockPeriod: action.payload,
      }
    default:
      return state
  }
}

export default lockModalReducer
