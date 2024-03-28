import { LockPeriod } from 'kasu-sdk/src/types'
import { useCallback, useContext } from 'react'

import lockModalContext from '@/context/lockModal/lockModal.context'
import { LockModalTypes } from '@/context/lockModal/lockModal.types'

const useLockModalState = (): LockModalTypes => {
  const context = useContext(lockModalContext)

  if (!Object.keys(context).length) {
    throw new Error('LockModalContext must be used within its provider')
  }

  const { dispatch } = context

  const setAmount = useCallback(
    (amount: string) => {
      dispatch({
        type: 'SET_AMOUNT',
        payload: amount,
      })
    },
    [dispatch]
  )

  const setSelectedLockPeriod = useCallback(
    (selectedLockPeriod: LockPeriod) => {
      dispatch({
        type: 'SET_SELECTED_LOCK_PERIOD',
        payload: selectedLockPeriod,
      })
    },
    [dispatch]
  )

  return {
    ...context,
    setAmount,
    setSelectedLockPeriod,
  }
}

export default useLockModalState
