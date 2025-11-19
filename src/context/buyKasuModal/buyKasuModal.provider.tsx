'use client'

import { LockPeriod } from '@kasufinance/kasu-sdk/src/services/Locking/types'
import { ReactNode, useReducer } from 'react'

import useBuyKasuModalActions from '@/context/buyKasuModal/buyKasuModal.actions'
import BuyKasuModalContext from '@/context/buyKasuModal/buyKasuModal.context'
import buyKasuModalReducer from '@/context/buyKasuModal/buyKasuModal.reducer'
import { BuyKasuModalStateType } from '@/context/buyKasuModal/buyKasuModal.types'

import { SupportedTokens } from '@/constants/tokens'

type BuyKasuModalStateProps = {
  children: ReactNode
  defaultLockPeriod: LockPeriod
  initialToken?: SupportedTokens
}

const initialState: Omit<
  BuyKasuModalStateType,
  'selectedToken' | 'selectedLockPeriod'
> = {
  swapAndLock: false,
  amount: '',
  amountInUSD: '',
  isDebouncing: false,
  isValidating: false,
}

const BuyKasuModalState: React.FC<BuyKasuModalStateProps> = ({
  children,
  initialToken,
  defaultLockPeriod,
}) => {
  const initialReducerState = {
    ...initialState,
    selectedToken: initialToken ?? SupportedTokens.USDC,
    selectedLockPeriod: defaultLockPeriod,
  }

  const [state, dispatch] = useReducer(buyKasuModalReducer, initialReducerState)

  const BuyKasuModalActions = useBuyKasuModalActions(dispatch)

  return (
    <BuyKasuModalContext.Provider value={{ ...state, ...BuyKasuModalActions }}>
      {children}
    </BuyKasuModalContext.Provider>
  )
}

export default BuyKasuModalState
