import React, { ReactNode, useReducer } from 'react'

import WithdrawModalContext from '@/context/withdrawModal/withdrawModal.context'
import withdrawModalReducer from '@/context/withdrawModal/withdrawModal.reducer'
import {
  Tranche,
  WithdrawModalStateType,
  WithdrawProgress,
} from '@/context/withdrawModal/withdrawModal.types'

type WithdrawModalProviderProps = {
  children: ReactNode
}

const initialState: WithdrawModalStateType = {
  amount: '',
  selectedTranche: Tranche.SENIOR_TRANCHE,
  withdrawProgress: WithdrawProgress.REQUEST,
  errorMsg: '',
  processing: false,
}

const WithdrawModalProvider: React.FC<WithdrawModalProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(withdrawModalReducer, initialState)

  return (
    <WithdrawModalContext.Provider value={{ ...state, dispatch }}>
      {children}
    </WithdrawModalContext.Provider>
  )
}

export default WithdrawModalProvider
