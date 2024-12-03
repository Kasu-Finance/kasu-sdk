import { ReactNode, useReducer } from 'react'

import useWithdrawModalActions from '@/context/withdrawModal/withdrawModal.actions'
import WithdrawModalContext from '@/context/withdrawModal/withdrawModal.context'
import withdrawModalReducer from '@/context/withdrawModal/withdrawModal.reducer'
import { WithdrawModalStateType } from '@/context/withdrawModal/withdrawModal.types'

import { HexString } from '@/types/lending'

type WithdrawModalProviderProps = {
  children: ReactNode
  defaultTrancheId: HexString
}

const initialState: Omit<WithdrawModalStateType, 'trancheId'> = {
  amount: '',
  txHash: undefined,
}

const WithdrawModalProvider: React.FC<WithdrawModalProviderProps> = ({
  children,
  defaultTrancheId,
}) => {
  const [state, dispatch] = useReducer(withdrawModalReducer, {
    ...initialState,
    trancheId: defaultTrancheId,
  })

  const withdrawModalActions = useWithdrawModalActions(dispatch)

  return (
    <WithdrawModalContext.Provider
      value={{ ...state, ...withdrawModalActions }}
    >
      {children}
    </WithdrawModalContext.Provider>
  )
}

export default WithdrawModalProvider
