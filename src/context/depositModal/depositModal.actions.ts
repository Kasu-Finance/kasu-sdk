import { DepositModalActionType } from '@/context/depositModal/depositModal.types'

import { SupportedTokens } from '@/constants/tokens'

export const setAmount = (amount: string) => ({
  type: DepositModalActionType.SET_AMOUNT as const,
  payload: amount,
})

export const setSelectedTranche = (selectedTranche: `0x${string}`) => ({
  type: DepositModalActionType.SET_SELECTED_TRANCHE as const,
  payload: selectedTranche,
})

export const setTxHash = (txHash: string) => ({
  type: DepositModalActionType.SET_TX_HASH as const,
  payload: txHash,
})

export const setTermsAccepted = (termsAccepted: boolean) => ({
  type: DepositModalActionType.SET_TERMS_ACCEPTED as const,
  payload: termsAccepted,
})

export const setAmountInUSD = (amountInUSD: string | undefined) => ({
  type: DepositModalActionType.SET_AMOUNT_IN_USD as const,
  payload: amountInUSD,
})

export const setSimulatedDuration = (simulatedDuration: number) => ({
  type: DepositModalActionType.SET_SIMULATED_DURATION as const,
  payload: simulatedDuration,
})

export const setSelectedToken = (selectedToken: SupportedTokens) => ({
  type: DepositModalActionType.SET_SELECTED_TOKEN as const,
  payload: selectedToken,
})
