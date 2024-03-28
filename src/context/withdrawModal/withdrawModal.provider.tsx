import React, { ReactNode, useReducer } from 'react'

import WithdrawModalContext from '@/context/withdrawModal/withdrawModal.context'
import withdrawModalReducer from '@/context/withdrawModal/withdrawModal.reducer'
import {
  Tranche,
  WithdrawModalStateType,
} from '@/context/withdrawModal/withdrawModal.types'

type WithdrawModalProviderProps = {
  children: ReactNode
  defaultTrancheId: `0x${string}`
}

const initialState: WithdrawModalStateType = {
  amount: '',
  selectedTranche: Tranche.SENIOR_TRANCHE,
  trancheId: '0x0',
  errorMsg: '',
  processing: false,
}

const WithdrawModalProvider: React.FC<WithdrawModalProviderProps> = ({
  children,
  defaultTrancheId,
}) => {
  const [state, dispatch] = useReducer(withdrawModalReducer, {
    ...initialState,
    trancheId: defaultTrancheId,
  })

  return (
    <WithdrawModalContext.Provider value={{ ...state, dispatch }}>
      {children}
    </WithdrawModalContext.Provider>
  )
}

export default WithdrawModalProvider
