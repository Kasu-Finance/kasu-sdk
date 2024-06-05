'use client'

import { ReactNode, useReducer } from 'react'

import {
  setAmount,
  setAmountInUSD,
  setSelectedToken,
  setSelectedTranche,
  setSimulatedDuration,
  setTermsAccepted,
  setTxHash,
} from '@/context/depositModal/depositModal.actions'
import DepositModalContext from '@/context/depositModal/depositModal.context'
import depositModalReducer from '@/context/depositModal/depositModal.reducer'
import {
  DepositModalStateType,
  DepositModalTypes,
} from '@/context/depositModal/depositModal.types'

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

  const context: DepositModalTypes = {
    ...state,
    setAmount: (amount: string) => dispatch(setAmount(amount)),
    setAmountInUSD: (amountInUSD: string | undefined) =>
      dispatch(setAmountInUSD(amountInUSD)),
    setSelectedTranche: (selectedTranche: `0x${string}`) =>
      dispatch(setSelectedTranche(selectedTranche)),
    setTxHash: (txHash: string) => dispatch(setTxHash(txHash)),
    setTermsAccepted: (termsAccepted: boolean) =>
      dispatch(setTermsAccepted(termsAccepted)),
    setSimulatedDuration: (simulatedDuration: number) =>
      dispatch(setSimulatedDuration(simulatedDuration)),
    setSelectedToken: (selectedToken: SupportedTokens) =>
      dispatch(setSelectedToken(selectedToken)),
  }

  return (
    <DepositModalContext.Provider value={context}>
      {children}
    </DepositModalContext.Provider>
  )
}

export default DepositModalState
