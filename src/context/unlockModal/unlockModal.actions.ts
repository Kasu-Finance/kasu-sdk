import { UserLock } from '@kasufinance/kasu-sdk'
import { Dispatch, useMemo } from 'react'

import {
  UnlockModalActions,
  UnlockModalActionType,
  UnlockModalFunctions,
} from '@/context/unlockModal/unlockModal.types'

const useUnlockModalActions = (
  dispatch: Dispatch<UnlockModalActions>
): UnlockModalFunctions =>
  useMemo(
    () => ({
      setUserLock: (userLock: UserLock) => {
        dispatch({
          type: UnlockModalActionType.SET_USER_LOCK,
          payload: userLock,
        })
      },
      setAmount: (amount: string) => {
        dispatch({
          type: UnlockModalActionType.SET_AMOUNT,
          payload: amount,
        })
      },
      setTxHash: (txHash: string) =>
        dispatch({
          type: UnlockModalActionType.SET_TX_HASH,
          payload: txHash,
        }),
    }),
    [dispatch]
  )

export default useUnlockModalActions
