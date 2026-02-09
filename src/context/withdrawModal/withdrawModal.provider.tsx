import { PoolOverview } from '@kasufinance/kasu-sdk'
import { ReactNode, useReducer } from 'react'

import useWithdrawModalActions from '@/context/withdrawModal/withdrawModal.actions'
import WithdrawModalContext from '@/context/withdrawModal/withdrawModal.context'
import withdrawModalReducer from '@/context/withdrawModal/withdrawModal.reducer'
import { WithdrawModalStateType } from '@/context/withdrawModal/withdrawModal.types'

import { HexString } from '@/types/lending'

type WithdrawModalProviderProps = {
  children: ReactNode
  defaultTrancheId?: HexString
  defaultPool: PoolOverview
}

const initialState: Omit<WithdrawModalStateType, 'trancheId' | 'selectedPool'> =
  {
    amount: '',
    txHash: undefined,
  }

const WithdrawModalProvider: React.FC<WithdrawModalProviderProps> = ({
  children,
  defaultTrancheId,
  defaultPool,
}) => {
  const [state, dispatch] = useReducer(withdrawModalReducer, {
    ...initialState,
    trancheId: defaultTrancheId,
    selectedPool: defaultPool,
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
