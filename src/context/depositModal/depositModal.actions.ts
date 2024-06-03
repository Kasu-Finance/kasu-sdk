import { DepositModalActionType } from '@/context/depositModal/depositModal.types'

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
