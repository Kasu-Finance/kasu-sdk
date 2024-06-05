import {
  ToastActions,
  ToastActionsType,
  ToastStateType,
} from '@/context/toast/toast.types'

const toastReducer = (
  state: ToastStateType,
  action: ToastActions
): ToastStateType => {
  switch (action.type) {
    case ToastActionsType.SET_TOAST:
      return {
        ...state,
        toast: action.payload,
      }
    case ToastActionsType.REMOVE_TOAST:
      return {
        ...state,
        toast: null,
      }
    default:
      return state
  }
}

export default toastReducer
