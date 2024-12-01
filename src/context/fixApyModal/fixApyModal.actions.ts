import { Dispatch, useMemo } from 'react'

import {
  FixApyModalActions,
  FixApyModalActionTypes,
  FixApyModalFunctions,
} from '@/context/fixApyModal/fixApyModal.types'

const useFixApyModalActions = (
  dispatch: Dispatch<FixApyModalActions>
): FixApyModalFunctions =>
  useMemo(
    () => ({
      setAmount: (amount: string) => {
        dispatch({
          type: FixApyModalActionTypes.SET_AMOUNT,
          payload: amount,
        })
      },
      setTxHash: (txHash: string) =>
        dispatch({
          type: FixApyModalActionTypes.SET_TX_HASH,
          payload: txHash,
        }),
      setFixedTermConfigId: (fixedTermConfigId: string) =>
        dispatch({
          type: FixApyModalActionTypes.SET_FIXED_TERM_CONFIG_ID,
          payload: fixedTermConfigId,
        }),
    }),
    [dispatch]
  )

export default useFixApyModalActions
