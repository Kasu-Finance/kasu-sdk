export type DepositModalActions =
  | {
      type: 'SET_AMOUNT'
      payload: string
    }
  | {
      type: 'SET_SELECTED_TRANCHE'
      payload: string
    }
  | {
      type: 'SET_TX_HASH'
      payload: string
    }

export type DepositModalStateType = {
  amount: string
  trancheId: string
  txHash: string | undefined
}

export type DepositModalFunctions = {
  setAmount: (amount: string) => void
  setSelectedTranche: (selectedTranche: string) => void
  setTxHash: (txHash: string) => void
}

export type DepositModalTypes = DepositModalStateType & DepositModalFunctions
