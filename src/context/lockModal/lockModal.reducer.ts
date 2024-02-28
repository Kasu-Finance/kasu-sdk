import {
  LockModalActions,
  LockModalStateType,
} from '@/context/lockModal/lockModal.types'

const lockModalReducer = (
  state: LockModalStateType,
  action: LockModalActions
): LockModalStateType => {
  switch (action.type) {
    case 'SET_AMOUNT':
      return {
        ...state,
        amount: action.payload,
      }
    case 'SET_SELECTED_LOCK_PERIOD':
      return {
        ...state,
        selectedLockPeriod: action.payload,
      }
    case 'SET_LOCK_STATE':
      return {
        ...state,
        lockState: action.payload,
      }
    case 'SET_LOCK_PROGRESS':
      return {
        ...state,
        lockProgress: action.payload,
      }
    default:
      return state
  }
}

export default lockModalReducer
