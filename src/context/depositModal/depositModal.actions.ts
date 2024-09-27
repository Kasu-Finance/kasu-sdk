import { Dispatch, useMemo } from 'react'

import {
  DepositModalActions,
  DepositModalActionType,
  DepositModalFunctions,
} from '@/context/depositModal/depositModal.types'

import { SupportedTokens } from '@/constants/tokens'

const useDepositModalActions = (
  dispatch: Dispatch<DepositModalActions>
): DepositModalFunctions =>
  useMemo(
    () => ({
      setAmount: (amount: string) =>
        dispatch({
          type: DepositModalActionType.SET_AMOUNT,
          payload: amount,
        }),
      setAmountInUSD: (amountInUSD: string | undefined) =>
        dispatch({
          type: DepositModalActionType.SET_AMOUNT_IN_USD,
          payload: amountInUSD,
        }),
      setSelectedToken: (selectedToken: SupportedTokens) =>
        dispatch({
          type: DepositModalActionType.SET_SELECTED_TOKEN,
          payload: selectedToken,
        }),
      setSelectedTranche: (selectedTranche: `0x${string}`) =>
        dispatch({
          type: DepositModalActionType.SET_SELECTED_TRANCHE,
          payload: selectedTranche,
        }),
      setSimulatedDuration: (simulatedDuration: number) =>
        dispatch({
          type: DepositModalActionType.SET_SIMULATED_DURATION,
          payload: simulatedDuration,
        }),
      setTermsAccepted: (termsAccepted: boolean) =>
        dispatch({
          type: DepositModalActionType.SET_TERMS_ACCEPTED,
          payload: termsAccepted,
        }),
      setTxHash: (txHash: string) =>
        dispatch({
          type: DepositModalActionType.SET_TX_HASH,
          payload: txHash,
        }),
      setIsValidating: (isValidating: boolean) =>
        dispatch({
          type: DepositModalActionType.SET_IS_VALIDATING,
          payload: isValidating,
        }),
      setIsDebouncing: (isDebouncing: boolean) =>
        dispatch({
          type: DepositModalActionType.SET_IS_DEBOUNCING,
          payload: isDebouncing,
        }),
    }),
    [dispatch]
  )

export default useDepositModalActions
