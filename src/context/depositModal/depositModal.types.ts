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
  | {
      type: 'SET_TERMS_ACCEPTED'
      payload: boolean
    }

export type DepositModalStateType = {
  amount: string
  trancheId: `0x${string}`
  txHash: string | undefined
  termsAccepted: boolean
}

export type DepositModalFunctions = {
  setAmount: (amount: string) => void
  setSelectedTranche: (selectedTranche: `0x${string}`) => void
  setTxHash: (txHash: string) => void
  setTermsAccepted: (termsAccepted: boolean) => void
}

export type DepositModalTypes = DepositModalStateType & DepositModalFunctions
