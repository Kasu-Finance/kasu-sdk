import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'

export enum LockModalActionType {
  SET_AMOUNT = 'SET_AMOUNT',
  SET_SELECTED_LOCK_PERIOD = 'SET_SELECTED_LOCK_PERIOD',
}

export type LockModalActions =
  | {
      type: LockModalActionType.SET_AMOUNT
      payload: string
    }
  | {
      type: LockModalActionType.SET_SELECTED_LOCK_PERIOD
      payload: LockPeriod
    }

export type LockModalStateType = {
  amount: string
  selectedLockPeriod: LockPeriod
}

export type LockModalFunctions = {
  setAmount: (amount: string) => void
  setSelectedLockPeriod: (selectedLockPeriod: LockPeriod) => void
}

export type LockModalTypes = LockModalStateType & LockModalFunctions
