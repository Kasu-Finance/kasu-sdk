'use client'

import { ReactNode, useReducer } from 'react'

import DepositModalContext from '@/context/depositModal/depositModal.context'
import depositModalReducer from '@/context/depositModal/depositModal.reducer'
import { DepositModalStateType } from '@/context/depositModal/depositModal.types'

type DepositModalStateProps = {
  children: ReactNode
  defaultTrancheId: string
}

const initialState: Omit<DepositModalStateType, 'trancheId'> = {
  amount: '',
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

  return (
    <DepositModalContext.Provider value={{ ...state, dispatch }}>
      {children}
    </DepositModalContext.Provider>
  )
}

export default DepositModalState
