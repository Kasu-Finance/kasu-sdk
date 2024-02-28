import { LockPeriod } from 'kasu-sdk/src/types'

export enum LockProgress {
  EDITING = 'EDITING',
  REVIEWING = 'REVIEWING',
  COMPLETED = 'COMPLETED',
}

export type LockState =
  | {
      type: 'focused'
      bgColor: string
    }
  | {
      type: 'error'
      bgColor: string
      errorMessage: string
    }
  | { type: 'default'; bgColor: undefined }

export type LockStateParam =
  | {
      type: 'focused'
    }
  | {
      type: 'error'
      errorMessage: string
    }
  | { type: 'default' }

export type LockModalActions =
  | {
      type: 'SET_AMOUNT'
      payload: string
    }
  | {
      type: 'SET_SELECTED_LOCK_PERIOD'
      payload: LockPeriod
    }
  | {
      type: 'SET_LOCK_STATE'
      payload: LockState
    }
  | {
      type: 'SET_LOCK_PROGRESS'
      payload: LockProgress
    }

export type LockModalStateType = {
  amount: string
  selectedLockPeriod: LockPeriod
  lockState: LockState
  lockProgress: LockProgress
}

export type LockModalFunctions = {
  setAmount: (amount: string) => void
  setSelectedLockPeriod: (selectedLockPeriod: LockPeriod) => void
  setLockState: (lockState: LockStateParam) => void
  setLockProgress: (lockProgress: LockProgress) => void
}

export type LockModalTypes = LockModalStateType & LockModalFunctions
