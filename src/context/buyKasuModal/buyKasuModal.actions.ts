import { LockPeriod } from '@kasufinance/kasu-sdk/src/services/Locking/types'
import { Dispatch, useMemo } from 'react'

import {
  BuyKasuModalActions,
  BuyKasuModalActionType,
  BuyKasuModalFunctions,
} from '@/context/buyKasuModal/buyKasuModal.types'

import { SupportedTokens } from '@/constants/tokens'

const useBuyKasuModalActions = (
  dispatch: Dispatch<BuyKasuModalActions>
): BuyKasuModalFunctions =>
  useMemo(
    () => ({
      setSelectedToken: (selectedToken: SupportedTokens) =>
        dispatch({
          type: BuyKasuModalActionType.SET_SELECTED_TOKEN,
          payload: selectedToken,
        }),
      setAmount: (amount: string) =>
        dispatch({
          type: BuyKasuModalActionType.SET_AMOUNT,
          payload: amount,
        }),
      setAmountInUSD: (amountInUSD: string | undefined) =>
        dispatch({
          type: BuyKasuModalActionType.SET_AMOUNT_IN_USD,
          payload: amountInUSD,
        }),
      toggleSwapAndLock: () =>
        dispatch({
          type: BuyKasuModalActionType.TOGGLE_SWAP_AND_LOCK,
        }),

      setIsValidating: (isValidating: boolean) =>
        dispatch({
          type: BuyKasuModalActionType.SET_IS_VALIDATING,
          payload: isValidating,
        }),
      setIsDebouncing: (isDebouncing: boolean) =>
        dispatch({
          type: BuyKasuModalActionType.SET_IS_DEBOUNCING,
          payload: isDebouncing,
        }),
      setSelectedLockPeriod: (selectedLockPeriod: LockPeriod) =>
        dispatch({
          type: BuyKasuModalActionType.SET_SELECTED_LOCK_PERIOD,
          payload: selectedLockPeriod,
        }),
    }),
    [dispatch]
  )

export default useBuyKasuModalActions
