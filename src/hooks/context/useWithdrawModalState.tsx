import { useCallback, useContext } from 'react'

import WithdrawModalContext from '@/context/withdrawModal/withdrawModal.context'
import {
  Tranche,
  WithdrawActionTypes,
  WithdrawModalTypes,
  WithdrawProgress,
} from '@/context/withdrawModal/withdrawModal.types'

const useWithdrawModalState = (): WithdrawModalTypes => {
  const context = useContext(WithdrawModalContext)

  if (!context) {
    throw new Error(
      'useWithdrawModalState must be used within a WithdrawModalProvider'
    )
  }

  const { dispatch } = context

  const setAmount = useCallback(
    (amount: string) => {
      dispatch({
        type: WithdrawActionTypes.SET_AMOUNT,
        payload: amount,
      })
    },
    [dispatch]
  )

  const setSelectedTranche = useCallback(
    (selectedTranche: Tranche) => {
      dispatch({
        type: WithdrawActionTypes.SET_SELECTED_TRANCHE,
        payload: selectedTranche,
      })
    },
    [dispatch]
  )

  const setWithdrawProgress = useCallback(
    (withdrawProgress: WithdrawProgress) => {
      dispatch({
        type: WithdrawActionTypes.SET_WITHDRAW_PROGRESS,
        payload: withdrawProgress,
      })
    },
    [dispatch]
  )

  const setErrorMsg = useCallback(
    (errorMsg: string) => {
      dispatch({
        type: WithdrawActionTypes.SET_ERROR_MSG,
        payload: errorMsg,
      })
    },
    [dispatch]
  )

  const setProcessing = useCallback(
    (processing: boolean) => {
      dispatch({
        type: WithdrawActionTypes.SET_PROCESSING,
        payload: processing,
      })
    },
    [dispatch]
  )

  return {
    ...context,
    setAmount,
    setSelectedTranche,
    setWithdrawProgress,
    setErrorMsg,
    setProcessing,
  }
}

export default useWithdrawModalState
