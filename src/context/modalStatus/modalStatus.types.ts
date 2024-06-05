enum WithdrawSteps {
  STEP_1 = 0,
  STEP_2 = 1,
  STEP_3 = 3,
}

export enum ModalStatusAction {
  EDITING = 'EDITING',
  REVIEWING = 'REVIEWING',
  COMPLETED = 'COMPLETED',
  REQUEST = WithdrawSteps.STEP_1,
  APPROVE = WithdrawSteps.STEP_2,
  CONFIRM = WithdrawSteps.STEP_3,
}

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
  SET_MODAL_STATUS_ACTON = 'SET_MODAL_STATUS_ACTON',
}

export type ModalStatusActions =
  | {
      type: ModalStatusActionsType.SET_MODAL_STATUS_STATE
      payload: ModalStatusState
    }
  | {
      type: ModalStatusActionsType.SET_MODAL_STATUS_ACTON
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
