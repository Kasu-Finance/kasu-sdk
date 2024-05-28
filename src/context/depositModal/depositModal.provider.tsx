'use client'

import { ReactNode, useReducer } from 'react'

import DepositModalContext from '@/context/depositModal/depositModal.context'
import depositModalReducer from '@/context/depositModal/depositModal.reducer'
import { DepositModalStateType } from '@/context/depositModal/depositModal.types'

type DepositModalStateProps = {
  children: ReactNode
  defaultTrancheId: `0x${string}`
  initialAmount?: string
}

const initialState: Omit<DepositModalStateType, 'trancheId'> = {
  amount: '',
  amountInUSD: undefined,
  simulatedDuration: 0,
  txHash: undefined,
}

const DepositModalState: React.FC<DepositModalStateProps> = ({
  children,
  defaultTrancheId,
  initialAmount,
}) => {
  const [state, dispatch] = useReducer(depositModalReducer, {
    ...initialState,
    trancheId: defaultTrancheId,
    amount: initialAmount ?? '',
  })

  return (
    <DepositModalContext.Provider value={{ ...state, dispatch }}>
      {children}
    </DepositModalContext.Provider>
  )
}

export default DepositModalState
