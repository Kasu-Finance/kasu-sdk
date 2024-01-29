import { ToastActions, ToastStateType } from '@/context/toast/toast.types'

const toastReducer = (
  state: ToastStateType,
  action: ToastActions
): ToastStateType => {
  switch (action.type) {
    case 'SET_TOAST':
      return {
        ...state,
        toast: action.payload,
      }
    case 'REMOVE_TOAST':
      return {
        ...state,
        toast: null,
      }
    default:
      return state
  }
}

export default toastReducer
