import { Dispatch, useMemo } from 'react'

import {
  WithdrawModalActions,
  WithdrawModalActionTypes,
  WithdrawModalFunctions,
} from '@/context/withdrawModal/withdrawModal.types'

import { HexString } from '@/types/lending'

const useWithdrawModalActions = (
  dispatch: Dispatch<WithdrawModalActions>
): WithdrawModalFunctions =>
  useMemo(
    () => ({
      setAmount: (amount: string) => {
        dispatch({
          type: WithdrawModalActionTypes.SET_AMOUNT,
          payload: amount,
        })
      },
      setTxHash: (txHash: string) =>
        dispatch({
          type: WithdrawModalActionTypes.SET_TX_HASH,
          payload: txHash,
        }),
      setSelectedTranche: (selectedTranche: HexString) =>
        dispatch({
          type: WithdrawModalActionTypes.SET_SELECTED_TRANCHE,
          payload: selectedTranche,
        }),
    }),
    [dispatch]
  )

export default useWithdrawModalActions
