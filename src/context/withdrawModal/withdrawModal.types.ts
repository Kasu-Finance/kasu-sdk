import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'

import { HexString } from '@/types/lending'

export enum WithdrawModalActionTypes {
  SET_SELECTED_POOL = 'SET_SELECTED_POOL',
  SET_AMOUNT = 'SET_AMOUNT',
  SET_SELECTED_TRANCHE = 'SET_SELECTED_TRANCHE',
  SET_WITHDRAW_PROGRESS = 'SET_WITHDRAW_PROGRESS',
  SET_TX_HASH = 'SET_TX_HASH',
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
      type: WithdrawModalActionTypes.SET_AMOUNT
      payload: string
    }
  | {
      type: WithdrawModalActionTypes.SET_SELECTED_TRANCHE
      payload: HexString
    }
  | {
      type: WithdrawModalActionTypes.SET_TX_HASH
      payload: string
    }
  | {
      type: WithdrawModalActionTypes.SET_SELECTED_POOL
      payload: PoolOverview
    }

export type WithdrawModalStateType = {
  selectedPool: PoolOverview
  amount: string
  trancheId: HexString | undefined
  txHash: string | undefined
}

export type WithdrawModalFunctions = {
  setSelectedPool: (pool: PoolOverview) => void
  setAmount: (amount: string) => void
  setSelectedTranche: (selectedTranche: HexString) => void
  setTxHash: (txHash: string) => void
}

export type WithdrawModalTypes = WithdrawModalStateType & WithdrawModalFunctions
