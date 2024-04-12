'use client'

import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'
import { ReactNode, useReducer } from 'react'

import LockModalContext from '@/context/lockModal/lockModal.context'
import lockModalReducer from '@/context/lockModal/lockModal.reducer'
import { LockModalStateType } from '@/context/lockModal/lockModal.types'

type LockModalStateProps = {
  children: ReactNode
  defaultLockPeriod: LockPeriod
}

const initialState: Omit<LockModalStateType, 'selectedLockPeriod'> = {
  amount: '',
}

const LockModalState: React.FC<LockModalStateProps> = ({
  children,
  defaultLockPeriod,
}) => {
  const [state, dispatch] = useReducer(lockModalReducer, {
    ...initialState,
    selectedLockPeriod: defaultLockPeriod,
  })

  return (
    <LockModalContext.Provider value={{ ...state, dispatch }}>
      {children}
    </LockModalContext.Provider>
  )
}

export default LockModalState
