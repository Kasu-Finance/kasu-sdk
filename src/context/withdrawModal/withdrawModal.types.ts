import { HexString } from '@/types/lending'

export enum WithdrawActionTypes {
  SET_AMOUNT = 'SET_AMOUNT',
  SET_SELECTED_TRANCHE = 'SET_SELECTED_TRANCHE',
  SET_WITHDRAW_PROGRESS = 'SET_WITHDRAW_PROGRESS',
  SET_PROCESSING = 'SET_PROCESSING',
}

export enum WithdrawMetrics {
  TOTAL_INVESTMENT = 'totalInvestment',
  TRANCHE_INVESTMENT = 'trancheInvestment',
  TRANCHE = 'tranche',
  TO_WALLET = 'toWallet',
}

export type WithdrawModalActions =
  | {
      type: WithdrawActionTypes.SET_AMOUNT
      payload: string
    }
  | {
      type: WithdrawActionTypes.SET_SELECTED_TRANCHE
      payload: HexString
    }
  | {
      type: WithdrawActionTypes.SET_PROCESSING
      payload: boolean
    }

export type WithdrawModalStateType = {
  amount: string
  selectedTranche: HexString
  processing: boolean
}

export type WithdrawModalFunctions = {
  setAmount: (amount: string) => void
  setSelectedTranche: (selectedTranche: HexString) => void
  setProcessing: (processing: boolean) => void
}

export type WithdrawModalTypes = WithdrawModalStateType & WithdrawModalFunctions
