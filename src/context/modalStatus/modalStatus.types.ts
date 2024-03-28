export enum ModalStatusAction {
  EDITING = 'EDITING',
  REVIEWING = 'REVIEWING',
  COMPLETED = 'COMPLETED',
  REQUEST = 0,
  APPROVE = 1,
  CONFIRM = 3,
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

export type ModalStatusActions =
  | {
      type: 'SET_MODAL_STATUS_STATE'
      payload: ModalStatusState
    }
  | {
      type: 'SET_MODAL_STATUS_ACTON'
      payload: ModalStatusAction
    }

export type ModalStatusStateType = {
  modalStatus: ModalStatusState
  modalStatusAction: ModalStatusAction
}

export type ModalStatusFunctions = {
  setModalStatus: (modalStatus: ModalStatusParam) => void
  setModalStatusAction: (modalStatusAction: ModalStatusAction) => void
}

export type ModalStatusTypes = ModalStatusStateType & ModalStatusFunctions
