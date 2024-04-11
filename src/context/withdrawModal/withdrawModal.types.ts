import { HexString } from '@/types/lending'

export enum WithdrawActionTypes {
  SET_AMOUNT = 'SET_AMOUNT',
  SET_SELECTED_TRANCHE = 'SET_SELECTED_TRANCHE',
  SET_WITHDRAW_PROGRESS = 'SET_WITHDRAW_PROGRESS',
}

export enum WithdrawMetrics {
  TOTAL_INVESTMENT = 'totalInvestment',
  TRANCHE_INVESTMENT = 'trancheInvestment',
  TRANCHE = 'tranche',
  TO_WALLET = 'toWallet',
  WITHDRAW_REQUEST = 'withdrawRequest',
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

export type WithdrawModalStateType = {
  amount: string
  selectedTranche: HexString
}

export type WithdrawModalFunctions = {
  setAmount: (amount: string) => void
  setSelectedTranche: (selectedTranche: HexString) => void
}

export type WithdrawModalTypes = WithdrawModalStateType & WithdrawModalFunctions
