export enum FixApyModalActionTypes {
  SET_AMOUNT = 'SET_AMOUNT',
  SET_FIXED_TERM_CONFIG_ID = 'SET_FIXED_TERM_CONFIG_ID',
  SET_TX_HASH = 'SET_TX_HASH',
}

export type FixApyModalActions =
  | {
      type: FixApyModalActionTypes.SET_AMOUNT
      payload: string
    }
  | {
      type: FixApyModalActionTypes.SET_FIXED_TERM_CONFIG_ID
      payload: string
    }
  | {
      type: FixApyModalActionTypes.SET_TX_HASH
      payload: string
    }

export type FixApyModalStateType = {
  amount: string
  fixedTermConfigId: string
  txHash: string | undefined
}

export type FixApyModalFunctions = {
  setAmount: (amount: string) => void
  setFixedTermConfigId: (fixedTermConfigId: string) => void
  setTxHash: (txHash: string) => void
}

export type FixApyModalTypes = FixApyModalStateType & FixApyModalFunctions
