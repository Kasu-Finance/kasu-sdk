import { useCallback, useContext } from 'react'

import WithdrawModalContext from '@/context/withdrawModal/withdrawModal.context'
import {
  WithdrawActionTypes,
  WithdrawModalTypes,
} from '@/context/withdrawModal/withdrawModal.types'

import { HexString } from '@/types/lending'

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
    (selectedTranche: HexString) =>
      dispatch({
        type: WithdrawActionTypes.SET_SELECTED_TRANCHE,
        payload: selectedTranche,
      }),
    [dispatch]
  )

  return {
    ...context,
    setAmount,
    setSelectedTranche,
  }
}

export default useWithdrawModalState
