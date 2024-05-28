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
    (amount: string) =>
      dispatch({
        type: 'SET_AMOUNT',
        payload: amount,
      }),
    [dispatch]
  )

  const setAmountInUSD = useCallback(
    (amountInUSD: string | undefined) =>
      dispatch({
        type: 'SET_AMOUNT_IN_USD',
        payload: amountInUSD,
      }),
    [dispatch]
  )

  const setSelectedTranche = useCallback(
    (selectedTranche: `0x${string}`) =>
      dispatch({
        type: 'SET_SELECTED_TRANCHE',
        payload: selectedTranche,
      }),
    [dispatch]
  )

  const setTxHash = useCallback(
    (txHash: string) => dispatch({ type: 'SET_TX_HASH', payload: txHash }),
    [dispatch]
  )

  const setSimulatedDuration = useCallback(
    (simulatedDuration: number) =>
      dispatch({ type: 'SET_SIMULATED_DURATION', payload: simulatedDuration }),
    [dispatch]
  )

  return {
    ...context,
    setAmount,
    setAmountInUSD,
    setSelectedTranche,
    setTxHash,
    setSimulatedDuration,
  }
}

export default useDepositModalState
