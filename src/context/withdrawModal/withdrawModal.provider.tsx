import { ReactNode, useReducer } from 'react'

import WithdrawModalContext from '@/context/withdrawModal/withdrawModal.context'
import withdrawModalReducer from '@/context/withdrawModal/withdrawModal.reducer'
import { WithdrawModalStateType } from '@/context/withdrawModal/withdrawModal.types'

import { ZERO_ADDRESS } from '@/constants/pool'

import { HexString } from '@/types/lending'

type WithdrawModalProviderProps = {
  children: ReactNode
  defaultTrancheId: HexString
}

const initialState: WithdrawModalStateType = {
  amount: '',
  selectedTranche: ZERO_ADDRESS,
}

const WithdrawModalProvider: React.FC<WithdrawModalProviderProps> = ({
  children,
  defaultTrancheId,
}) => {
  const [state, dispatch] = useReducer(withdrawModalReducer, {
    ...initialState,
    selectedTranche: defaultTrancheId,
  })

  return (
    <WithdrawModalContext.Provider value={{ ...state, dispatch }}>
      {children}
    </WithdrawModalContext.Provider>
  )
}

export default WithdrawModalProvider
