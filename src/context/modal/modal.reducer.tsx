import {
  ModalAction,
  Modals,
  ModalsActionTypes,
} from '@/context/modal/modal.types'

export const modalReducer = (state: Modals, action: ModalAction): Modals => {
  switch (action.type) {
    case ModalsActionTypes.OPEN_MODAL:
      return {
        ...state,
        [action.name]: {
          isOpen: true,
          ...action.content,
        },
      }
    case ModalsActionTypes.CLOSE_MODAL:
      return {
        ...state,
        [action.name]: { isOpen: false },
      }
  }
}
