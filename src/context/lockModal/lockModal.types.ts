import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'

export type LockModalActions =
  | {
      type: 'SET_AMOUNT'
      payload: string
    }
  | {
      type: 'SET_SELECTED_LOCK_PERIOD'
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
