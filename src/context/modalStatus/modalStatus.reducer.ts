import {
  ModalStatusActions,
  ModalStatusStateType,
} from '@/context/modalStatus/modalStatus.types'

const modalStatusReducer = (
  state: ModalStatusStateType,
  action: ModalStatusActions
): ModalStatusStateType => {
  switch (action.type) {
    case 'SET_MODAL_STATUS_STATE':
      return {
        ...state,
        modalStatus: action.payload,
      }
    case 'SET_MODAL_STATUS_ACTON':
      return {
        ...state,
        modalStatusAction: action.payload,
      }
    default:
      return state
  }
}

export default modalStatusReducer
