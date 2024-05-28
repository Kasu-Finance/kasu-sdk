export type DepositModalActions =
  | {
      type: 'SET_AMOUNT'
      payload: string
    }
  | {
      type: 'SET_AMOUNT_IN_USD'
      payload: string | undefined
    }
  | {
      type: 'SET_SELECTED_TRANCHE'
      payload: `0x${string}`
    }
  | {
      type: 'SET_TX_HASH'
      payload: string
    }
  | {
      type: 'SET_SIMULATED_DURATION'
      payload: number
    }

export type DepositModalStateType = {
  amount: string
  simulatedDuration: number
  trancheId: `0x${string}`
  txHash: string | undefined
  amountInUSD: string | undefined
}

export type DepositModalFunctions = {
  setAmount: (amount: string) => void
  setAmountInUSD: (amountInUSD: string | undefined) => void
  setSelectedTranche: (selectedTranche: `0x${string}`) => void
  setTxHash: (txHash: string) => void
  setSimulatedDuration: (simulatedDuration: number) => void
}

export type DepositModalTypes = DepositModalStateType & DepositModalFunctions
