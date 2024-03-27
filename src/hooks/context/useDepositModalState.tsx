import { useCallback, useContext } from 'react'

import depositModalContext from '@/context/depositModal/depositModal.context'
import { DepositModalTypes } from '@/context/depositModal/depositModal.types'

const useDepositModalState = (): DepositModalTypes => {
  const context = useContext(depositModalContext)

  if (!Object.keys(context).length) {
    throw new Error('DepositModalContext must be used within its provider')
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

  const setSelectedTranche = useCallback(
    (selectedTranche: string) => {
      dispatch({
        type: 'SET_SELECTED_TRANCHE',
        payload: selectedTranche,
      })
    },
    [dispatch]
  )

  return {
    ...context,
    setAmount,
    setSelectedTranche,
  }
}

export default useDepositModalState
