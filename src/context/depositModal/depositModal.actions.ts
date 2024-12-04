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
      setFixedTermConfigId: (fixedTermConfigId: string) =>
        dispatch({
          type: DepositModalActionType.SET_FIXED_TERM_CONFIG_ID,
          payload: fixedTermConfigId,
        }),
      setSelectedTranche: (
        selectedTranche: `0x${string}`,
        defaultFixedTermConfigId: string | undefined
      ) =>
        dispatch({
          type: DepositModalActionType.SET_SELECTED_TRANCHE,
          payload: {
            trancheId: selectedTranche,
            defaultFixedTermConfigId,
          },
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
      setLoanContractAcccepted: (loanContractAccepted: boolean) =>
        dispatch({
          type: DepositModalActionType.SET_LOAN_CONTRACT_ACCEPTED,
          payload: loanContractAccepted,
        }),
    }),
    [dispatch]
  )

export default useDepositModalActions
