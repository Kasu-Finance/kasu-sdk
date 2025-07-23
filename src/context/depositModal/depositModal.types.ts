import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import { SupportedTokens } from '@/constants/tokens'

export enum DepositModalActionType {
  SET_AMOUNT = 'SET_AMOUNT',
  SET_SELECTED_TRANCHE = 'SET_SELECTED_TRANCHE',
  SET_TX_HASH = 'SET_TX_HASH',
  SET_TERMS_ACCEPTED = 'SET_TERMS_ACCEPTED',
  SET_AMOUNT_IN_USD = 'SET_AMOUNT_IN_USD',
  SET_SIMULATED_DURATION = 'SET_SIMULATED_DURATION',
  SET_SELECTED_TOKEN = 'SET_SELECTED_TOKEN',
  SET_IS_VALIDATING = 'SET_IS_VALIDATING',
  SET_IS_DEBOUNCING = 'SET_IS_DEBOUNCING',
  SET_FIXED_TERM_CONFIG_ID = 'SET_FIXED_TERM_CONFIG_ID',
  SET_LOAN_CONTRACT_ACCEPTED = 'SET_LOAN_CONTRACT_ACCEPTED',
  SET_DEPOSIT_MIN_MAX = 'SET_DEPOSIT_MIN_MAX',
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
  | {
      type: DepositModalActionType.SET_IS_VALIDATING
      payload: boolean
    }
  | {
      type: DepositModalActionType.SET_IS_DEBOUNCING
      payload: boolean
    }
  | {
      type: DepositModalActionType.SET_FIXED_TERM_CONFIG_ID
      payload: string
    }
  | {
      type: DepositModalActionType.SET_LOAN_CONTRACT_ACCEPTED
      payload: boolean
    }
  | {
      type: DepositModalActionType.SET_DEPOSIT_MIN_MAX
      payload: {
        minDeposit: string
        maxDeposit: string
      }
    }

export type DepositModalStateType = {
  pool: PoolOverview
  amount: string
  simulatedDuration: number
  trancheId: `0x${string}`
  fixedTermConfigId: string | undefined
  txHash: string | undefined
  amountInUSD: string | undefined
  selectedToken: SupportedTokens
  termsAccepted: boolean
  loanContractAccepted: boolean
  isValidating: boolean
  isDebouncing: boolean
  minDeposit: string
  maxDeposit: string
  currentEpochDepositedAmountMap: Map<string, string>
  currentEpochFtdAmountMap: Map<string, string[]>
}

export type DepositModalFunctions = {
  setAmount: (amount: string) => void
  setAmountInUSD: (amountInUSD: string | undefined) => void
  setSelectedTranche: (selectedTranche: `0x${string}`) => void
  setFixedTermConfigId: (fixedTermConfigId: string) => void
  setTxHash: (txHash: string) => void
  setSimulatedDuration: (simulatedDuration: number) => void
  setSelectedToken: (selectedToken: SupportedTokens) => void
  setTermsAccepted: (termsAccepted: boolean) => void
  setIsValidating: (isValidating: boolean) => void
  setIsDebouncing: (isDebouncing: boolean) => void
  setLoanContractAcccepted: (loanContractAccepted: boolean) => void
  setDepositMinMax: (payload: {
    minDeposit: string
    maxDeposit: string
  }) => void
}

export type DepositModalTypes = DepositModalStateType & DepositModalFunctions
