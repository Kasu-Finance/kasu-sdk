export enum WithdrawActionTypes {
  SET_AMOUNT = 'SET_AMOUNT',
  SET_SELECTED_TRANCHE = 'SET_SELECTED_TRANCHE',
  SET_WITHDRAW_PROGRESS = 'SET_WITHDRAW_PROGRESS',
  SET_ERROR_MSG = 'SET_ERROR_MSG',
  SET_PROCESSING = 'SET_PROCESSING',
}

export enum WithdrawMetrics {
  TOTAL_INVESTMENT = 'totalInvestment',
  TRANCHE_INVESTMENT = 'trancheInvestment',
  TRANCHE = 'tranche',
  TO_WALLET = 'toWallet',
}

export enum Tranche {
  JUNIOR_TRANCHE = 'Junior Tranche',
  MEZZANINE_TRANCHE = 'Mezzanine Tranche',
  SENIOR_TRANCHE = 'Senior Tranche',
}

export type WithdrawModalActions =
  | {
      type: WithdrawActionTypes.SET_AMOUNT
      payload: string
    }
  | {
      type: WithdrawActionTypes.SET_SELECTED_TRANCHE
      payload: `0x${string}`
    }
  | {
      type: WithdrawActionTypes.SET_ERROR_MSG
      payload: string
    }
  | {
      type: WithdrawActionTypes.SET_PROCESSING
      payload: boolean
    }

export type WithdrawModalStateType = {
  amount: string
  selectedTranche: `0x${string}`
  errorMsg: string
  processing: boolean
}

export type WithdrawModalFunctions = {
  setAmount: (amount: string) => void
  setSelectedTranche: (selectedTranche: `0x${string}`) => void
  setErrorMsg: (errorMsg: string) => void
  setProcessing: (processing: boolean) => void
}

export type WithdrawModalTypes = WithdrawModalStateType & WithdrawModalFunctions
