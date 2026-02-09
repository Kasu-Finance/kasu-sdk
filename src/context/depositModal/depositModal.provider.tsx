'use client'

import { PoolOverview } from '@kasufinance/kasu-sdk'
import { ReactNode, useMemo, useReducer } from 'react'

import useDepositModalActions from '@/context/depositModal/depositModal.actions'
import DepositModalContext from '@/context/depositModal/depositModal.context'
import depositModalReducer from '@/context/depositModal/depositModal.reducer'
import { DepositModalStateType } from '@/context/depositModal/depositModal.types'

import { SupportedTokens } from '@/constants/tokens'
import calculateDepositMinMax from '@/utils/lending/calculateDepositMinMax'

type DepositModalStateProps = {
  children: ReactNode
  pool: PoolOverview
  defaultTrancheId: `0x${string}`
  initialFixedTermConfigId?: string
  initialAmount?: string
  initialUsdAmount?: string
  initialTranche?: `0x${string}`
  currentEpochDepositedAmountMap: Map<string, string>
  currentEpochFtdAmountMap: Map<string, string[]>
}

const initialState: Omit<
  DepositModalStateType,
  | 'trancheId'
  | 'amount'
  | 'selectedToken'
  | 'currentEpochDepositedAmountMap'
  | 'currentEpochFtdAmountMap'
  | 'minDeposit'
  | 'maxDeposit'
  | 'pool'
> = {
  amountInUSD: undefined,
  simulatedDuration: 0,
  txHash: undefined,
  fixedTermConfigId: undefined,
  termsAccepted: false,
  isValidating: false,
  isDebouncing: false,
  loanContractAccepted: false,
}

const DepositModalState: React.FC<DepositModalStateProps> = ({
  children,
  pool,
  defaultTrancheId,
  initialAmount,
  initialUsdAmount,
  initialTranche,
  initialFixedTermConfigId,
  currentEpochDepositedAmountMap,
  currentEpochFtdAmountMap,
}) => {
  const trancheId = useMemo(
    () => initialTranche ?? defaultTrancheId,
    [initialTranche, defaultTrancheId]
  )

  const { minDeposit, maxDeposit } = useMemo(
    () =>
      calculateDepositMinMax(
        pool.tranches,
        trancheId,
        currentEpochDepositedAmountMap,
        currentEpochFtdAmountMap,
        initialFixedTermConfigId ?? undefined
      ),
    [
      pool.tranches,
      trancheId,
      currentEpochDepositedAmountMap,
      currentEpochFtdAmountMap,
      initialFixedTermConfigId,
    ]
  )

  const [state, dispatch] = useReducer(depositModalReducer, {
    ...initialState,
    trancheId,
    pool,
    amount: initialAmount ?? '',
    amountInUSD: initialUsdAmount ?? '',
    selectedToken: SupportedTokens.USDC,
    fixedTermConfigId: initialFixedTermConfigId ?? undefined,
    currentEpochDepositedAmountMap,
    currentEpochFtdAmountMap,
    minDeposit,
    maxDeposit,
  })

  const depositModalActions = useDepositModalActions(dispatch)

  return (
    <DepositModalContext.Provider value={{ ...state, ...depositModalActions }}>
      {children}
    </DepositModalContext.Provider>
  )
}

export default DepositModalState
