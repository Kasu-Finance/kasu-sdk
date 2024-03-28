export type DepositModalActions =
  | {
      type: 'SET_AMOUNT'
      payload: string
    }
  | {
      type: 'SET_SELECTED_TRANCHE'
      payload: `0x${string}`
    }
  | {
      type: 'SET_TX_HASH'
      payload: string
    }

export type DepositModalStateType = {
  amount: string
  trancheId: `0x${string}`
  txHash: string | undefined
}

export type DepositModalFunctions = {
  setAmount: (amount: string) => void
  setSelectedTranche: (selectedTranche: `0x${string}`) => void
  setTxHash: (txHash: string) => void
}

export type DepositModalTypes = DepositModalStateType & DepositModalFunctions
