'use client'

import { ReactNode, useReducer } from 'react'

import useDepositModalActions from '@/context/depositModal/depositModal.actions'
import DepositModalContext from '@/context/depositModal/depositModal.context'
import depositModalReducer from '@/context/depositModal/depositModal.reducer'
import { DepositModalStateType } from '@/context/depositModal/depositModal.types'

import { SupportedTokens } from '@/constants/tokens'

type DepositModalStateProps = {
  children: ReactNode
  defaultTrancheId: `0x${string}`
  initialAmount?: string
  initialTranche?: `0x${string}`
  initialToken?: SupportedTokens
}

const initialState: Omit<
  DepositModalStateType,
  'trancheId' | 'amount' | 'selectedToken'
> = {
  amountInUSD: undefined,
  simulatedDuration: 0,
  txHash: undefined,
  termsAccepted: false,
}

const DepositModalState: React.FC<DepositModalStateProps> = ({
  children,
  defaultTrancheId,
  initialAmount,
  initialTranche,
  initialToken,
}) => {
  const [state, dispatch] = useReducer(depositModalReducer, {
    ...initialState,
    trancheId: initialTranche ?? defaultTrancheId,
    amount: initialAmount ?? '',
    selectedToken: initialToken ?? SupportedTokens.USDC,
  })

  const depositModalActions = useDepositModalActions(dispatch)

  return (
    <DepositModalContext.Provider value={{ ...state, ...depositModalActions }}>
      {children}
    </DepositModalContext.Provider>
  )
}

export default DepositModalState
