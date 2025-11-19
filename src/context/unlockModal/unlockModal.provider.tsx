'use client'

import { UserLock } from '@kasufinance/kasu-sdk/src/services/Locking/types'
import { ReactNode, useReducer } from 'react'

import useUnlockModalActions from '@/context/unlockModal/unlockModal.actions'
import UnlockModalContext from '@/context/unlockModal/unlockModal.context'
import unlockModalReducer from '@/context/unlockModal/unlockModal.reducer'
import { UnlockModalStateType } from '@/context/unlockModal/unlockModal.types'

type UnlockModalStateProps = {
  children: ReactNode
  defaultUserLock: UserLock
}

const initialState: Omit<UnlockModalStateType, 'userLock'> = {
  amount: '',
  txHash: undefined,
}

const UnlockModalState: React.FC<UnlockModalStateProps> = ({
  children,
  defaultUserLock,
}) => {
  const [state, dispatch] = useReducer(unlockModalReducer, {
    ...initialState,
    userLock: defaultUserLock,
  })

  const unlockModalActions = useUnlockModalActions(dispatch)

  return (
    <UnlockModalContext.Provider value={{ ...state, ...unlockModalActions }}>
      {children}
    </UnlockModalContext.Provider>
  )
}

export default UnlockModalState
