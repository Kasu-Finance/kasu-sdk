import {
  LoadingMaskActions,
  LoadingMaskState,
} from '@/context/loadingMask/loadingMask.types'

const loadingMaskReducer = (
  state: LoadingMaskState,
  action: LoadingMaskActions
): LoadingMaskState => {
  switch (action.type) {
    case 'SHOW':
      return { isOpen: true, message: action.message }
    case 'HIDE':
      return { isOpen: false, message: undefined }
    default:
      return state
  }
}

export default loadingMaskReducer
