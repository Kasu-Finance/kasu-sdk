import { useContext } from 'react'

import WithdrawModalContext from '@/context/withdrawModal/withdrawModal.context'
import { WithdrawModalTypes } from '@/context/withdrawModal/withdrawModal.types'

const useWithdrawModalState = (): WithdrawModalTypes => {
  const context = useContext(WithdrawModalContext)

  if (!context) {
    throw new Error(
      'useWithdrawModalState must be used within a WithdrawModalProvider'
    )
  }
  return context
}

export default useWithdrawModalState
