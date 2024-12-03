export enum ModalStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  FOCUSED = 'focused',
}

export type ModalStatusState =
  | {
      type: 'focused'
      bgColor: string
    }
  | {
      type: 'error'
      bgColor: string
      errorMessage: string
    }
  | {
      type: 'success'
      bgColor: string
    }
  | { type: 'default'; bgColor: undefined }

export type ModalStatusParam =
  | {
      type: 'focused'
    }
  | {
      type: 'error'
      errorMessage: string
    }
  | { type: 'default' }
  | { type: 'success' }

export enum ModalStatusActionsType {
  SET_MODAL_STATUS_STATE = 'SET_MODAL_STATUS_STATE',
}

export type ModalStatusActions = {
  type: ModalStatusActionsType.SET_MODAL_STATUS_STATE
  payload: ModalStatusState
}

export type ModalStatusStateType = {
  modalStatus: ModalStatusState
}

export type ModalStatusFunctions = {
  setModalStatus: (modalStatus: ModalStatusParam) => void
}

export type ModalStatusTypes = ModalStatusStateType & ModalStatusFunctions
