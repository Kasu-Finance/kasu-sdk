'use client'

import { ReactNode, useReducer } from 'react'

import {
  setAmount,
  setSelectedTranche,
  setTermsAccepted,
  setTxHash,
} from '@/context/depositModal/depositModal.actions'
import DepositModalContext from '@/context/depositModal/depositModal.context'
import depositModalReducer from '@/context/depositModal/depositModal.reducer'
import {
  DepositModalStateType,
  DepositModalTypes,
} from '@/context/depositModal/depositModal.types'

type DepositModalStateProps = {
  children: ReactNode
  defaultTrancheId: `0x${string}`
}

const initialState: Omit<DepositModalStateType, 'trancheId'> = {
  amount: '',
  termsAccepted: false,
  txHash: undefined,
}

const DepositModalState: React.FC<DepositModalStateProps> = ({
  children,
  defaultTrancheId,
}) => {
  const [state, dispatch] = useReducer(depositModalReducer, {
    ...initialState,
    trancheId: defaultTrancheId,
  })

  const context: DepositModalTypes = {
    ...state,
    setAmount: (amount: string) => dispatch(setAmount(amount)),
    setSelectedTranche: (selectedTranche: `0x${string}`) =>
      dispatch(setSelectedTranche(selectedTranche)),
    setTxHash: (txHash: string) => dispatch(setTxHash(txHash)),
    setTermsAccepted: (termsAccepted: boolean) =>
      dispatch(setTermsAccepted(termsAccepted)),
  }

  return (
    <DepositModalContext.Provider value={context}>
      {children}
    </DepositModalContext.Provider>
  )
}

export default DepositModalState
