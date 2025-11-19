import { LockPeriod } from '@kasufinance/kasu-sdk/src/services/Locking/types'

import { SupportedTokens } from '@/constants/tokens'

export enum BuyKasuModalActionType {
  SET_SELECTED_TOKEN = 'SET_SELECTED_TOKEN',
  SET_AMOUNT = 'SET_AMOUNT',
  SET_AMOUNT_IN_USD = 'SET_AMOUNT_IN_USD',
  TOGGLE_SWAP_AND_LOCK = 'TOGGLE_SWAP_AND_LOCK',
  SET_SELECTED_LOCK_PERIOD = 'SET_SELECTED_LOCK_PERIOD',
  SET_IS_VALIDATING = 'SET_IS_VALIDATING',
  SET_IS_DEBOUNCING = 'SET_IS_DEBOUNCING',
}

export type BuyKasuModalActions =
  | {
      type: BuyKasuModalActionType.SET_SELECTED_TOKEN
      payload: SupportedTokens
    }
  | {
      type: BuyKasuModalActionType.SET_AMOUNT
      payload: string
    }
  | {
      type: BuyKasuModalActionType.SET_AMOUNT_IN_USD
      payload: string | undefined
    }
  | {
      type: BuyKasuModalActionType.TOGGLE_SWAP_AND_LOCK
    }
  | {
      type: BuyKasuModalActionType.SET_IS_DEBOUNCING
      payload: boolean
    }
  | {
      type: BuyKasuModalActionType.SET_IS_VALIDATING
      payload: boolean
    }
  | {
      type: BuyKasuModalActionType.SET_SELECTED_LOCK_PERIOD
      payload: LockPeriod
    }

export type BuyKasuModalStateType = {
  swapAndLock: boolean
  selectedToken: SupportedTokens
  amount: string
  amountInUSD: string | undefined
  selectedLockPeriod: LockPeriod
  isValidating: boolean
  isDebouncing: boolean
}

export type BuyKasuModalFunctions = {
  setAmount: (amount: string) => void
  setAmountInUSD: (amountInUSD: string | undefined) => void
  setSelectedToken: (selectedToken: SupportedTokens) => void
  toggleSwapAndLock: () => void
  setIsValidating: (isValidating: boolean) => void
  setIsDebouncing: (isDebouncing: boolean) => void
  setSelectedLockPeriod: (selectedLockPeriod: LockPeriod) => void
}

export type BuyKasuModalTypes = BuyKasuModalStateType & BuyKasuModalFunctions
