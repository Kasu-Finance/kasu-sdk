export enum DepositModalActionType {
  SET_AMOUNT = 'SET_AMOUNT',
  SET_SELECTED_TRANCHE = 'SET_SELECTED_TRANCHE',
  SET_TX_HASH = 'SET_TX_HASH',
  SET_TERMS_ACCEPTED = 'SET_TERMS_ACCEPTED',
}

export type DepositModalActions =
  | {
      type: DepositModalActionType.SET_AMOUNT
      payload: string
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
      type: DepositModalActionType.SET_TERMS_ACCEPTED
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
