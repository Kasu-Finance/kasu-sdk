import { LockPeriod } from '@kasufinance/kasu-sdk/src/services/Locking/types'

export enum LockModalActionType {
  SET_AMOUNT = 'SET_AMOUNT',
  SET_SELECTED_LOCK_PERIOD = 'SET_SELECTED_LOCK_PERIOD',
  SET_TX_HASH = 'SET_TX_HASH',
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
  | {
      type: LockModalActionType.SET_TX_HASH
      payload: string
    }

export type LockModalStateType = {
  amount: string
  selectedLockPeriod: LockPeriod
  txHash: string | undefined
}

export type LockModalFunctions = {
  setAmount: (amount: string) => void
  setSelectedLockPeriod: (selectedLockPeriod: LockPeriod) => void
  setTxHash: (txHash: string) => void
}

export type LockModalTypes = LockModalStateType & LockModalFunctions
