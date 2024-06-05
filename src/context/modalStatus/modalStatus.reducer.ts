import {
  ModalStatusActions,
  ModalStatusActionsType,
  ModalStatusStateType,
} from '@/context/modalStatus/modalStatus.types'

const modalStatusReducer = (
  state: ModalStatusStateType,
  action: ModalStatusActions
): ModalStatusStateType => {
  switch (action.type) {
    case ModalStatusActionsType.SET_MODAL_STATUS_STATE:
      return {
        ...state,
        modalStatus: action.payload,
      }
    case ModalStatusActionsType.SET_MODAL_STATUS_ACTON:
      return {
        ...state,
        modalStatusAction: action.payload,
      }
  }
}

export default modalStatusReducer
