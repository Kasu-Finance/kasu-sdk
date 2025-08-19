import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'

export enum UnlockModalActionType {
  SET_AMOUNT = 'SET_AMOUNT',
  SET_TX_HASH = 'SET_TX_HASH',
  SET_USER_LOCK = 'SET_USER_LOCK',
}

export type UnlockModalActions =
  | {
      type: UnlockModalActionType.SET_AMOUNT
      payload: string
    }
  | {
      type: UnlockModalActionType.SET_TX_HASH
      payload: string
    }
  | {
      type: UnlockModalActionType.SET_USER_LOCK
      payload: UserLock
    }

export type UnlockModalStateType = {
  amount: string
  userLock: UserLock
  txHash: string | undefined
}

export type UnlockModalFunctions = {
  setUserLock: (userLock: UserLock) => void
  setAmount: (amount: string) => void
  setTxHash: (txHash: string) => void
}

export type UnlockModalTypes = UnlockModalStateType & UnlockModalFunctions
