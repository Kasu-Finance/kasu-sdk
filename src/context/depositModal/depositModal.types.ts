import { SupportedTokens } from '@/constants/tokens'

export enum DepositModalActionType {
  SET_AMOUNT = 'SET_AMOUNT',
  SET_SELECTED_TRANCHE = 'SET_SELECTED_TRANCHE',
  SET_TX_HASH = 'SET_TX_HASH',
  SET_TERMS_ACCEPTED = 'SET_TERMS_ACCEPTED',
  SET_AMOUNT_IN_USD = 'SET_AMOUNT_IN_USD',
  SET_SIMULATED_DURATION = 'SET_SIMULATED_DURATION',
  SET_SELECTED_TOKEN = 'SET_SELECTED_TOKEN',
}

export type DepositModalActions =
  | {
      type: DepositModalActionType.SET_AMOUNT
      payload: string
    }
  | {
      type: DepositModalActionType.SET_AMOUNT_IN_USD
      payload: string | undefined
    }
  | {
      type: DepositModalActionType.SET_SELECTED_TRANCHE
      payload: `0x${string}`
    }
  | {
      type: DepositModalActionType.SET_TX_HASH
      payload: string
    }
  | {
      type: DepositModalActionType.SET_SIMULATED_DURATION
      payload: number
    }
  | {
      type: DepositModalActionType.SET_SELECTED_TOKEN
      payload: SupportedTokens
    }
  | {
      type: DepositModalActionType.SET_TERMS_ACCEPTED
      payload: boolean
    }

export type DepositModalStateType = {
  amount: string
  simulatedDuration: number
  trancheId: `0x${string}`
  txHash: string | undefined
  amountInUSD: string | undefined
  selectedToken: SupportedTokens
  termsAccepted: boolean
}

export type DepositModalFunctions = {
  setAmount: (amount: string) => void
  setAmountInUSD: (amountInUSD: string | undefined) => void
  setSelectedTranche: (selectedTranche: `0x${string}`) => void
  setTxHash: (txHash: string) => void
  setSimulatedDuration: (simulatedDuration: number) => void
  setSelectedToken: (selectedToken: SupportedTokens) => void
  setTermsAccepted: (termsAccepted: boolean) => void
}

export type DepositModalTypes = DepositModalStateType & DepositModalFunctions
