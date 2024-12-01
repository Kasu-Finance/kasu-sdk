import { LockPeriod } from '@solidant/kasu-sdk/src/services/Locking/types'
import { Dispatch, useMemo } from 'react'

import {
  LockModalActions,
  LockModalActionType,
  LockModalFunctions,
} from '@/context/lockModal/lockModal.types'

const useLockModalActions = (
  dispatch: Dispatch<LockModalActions>
): LockModalFunctions =>
  useMemo(
    () => ({
      setAmount: (amount: string) => {
        dispatch({
          type: LockModalActionType.SET_AMOUNT,
          payload: amount,
        })
      },
      setSelectedLockPeriod: (selectedLockPeriod: LockPeriod) => {
        dispatch({
          type: LockModalActionType.SET_SELECTED_LOCK_PERIOD,
          payload: selectedLockPeriod,
        })
      },
      setTxHash: (txHash: string) =>
        dispatch({
          type: LockModalActionType.SET_TX_HASH,
          payload: txHash,
        }),
    }),
    [dispatch]
  )

export default useLockModalActions
