import { alpha, useTheme } from '@mui/material'
import { LockPeriod } from 'kasu-sdk/src/types'
import { useCallback, useContext } from 'react'

import lockModalContext from '@/context/lockModal/lockModal.context'
import {
  LockModalTypes,
  LockProgress,
  LockState,
  LockStateParam,
} from '@/context/lockModal/lockModal.types'

const useLockModalState = (): LockModalTypes => {
  const context = useContext(lockModalContext)

  const theme = useTheme()

  if (!Object.keys(context).length) {
    throw new Error('LockModalContext must be used within its provider')
  }

  const { dispatch, amount } = context

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

  const setLockState = useCallback(
    (lockState: LockStateParam) => {
      let newLockState: LockState = { type: 'default', bgColor: undefined }

      if (lockState.type !== 'default') {
        newLockState = {
          ...lockState,
          bgColor: alpha(
            theme.palette[lockState.type === 'error' ? 'error' : 'primary']
              .main,
            0.04
          ),
        }
      }

      dispatch({
        type: 'SET_LOCK_STATE',
        payload: newLockState,
      })
    },
    [dispatch, theme.palette]
  )

  const setLockProgress = useCallback(
    (lockProgress: LockProgress) => {
      if (!amount) {
        setLockState({ type: 'error', errorMessage: 'amount is required' })
        return
      }

      dispatch({ type: 'SET_LOCK_PROGRESS', payload: lockProgress })
    },
    [amount, dispatch, setLockState]
  )

  return {
    ...context,
    setAmount,
    setSelectedLockPeriod,
    setLockState,
    setLockProgress,
  }
}

export default useLockModalState
