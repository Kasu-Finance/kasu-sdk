import { useContext } from 'react'

import depositModalContext from '@/context/depositModal/depositModal.context'
import { DepositModalTypes } from '@/context/depositModal/depositModal.types'

const useDepositModalState = (): DepositModalTypes => {
  const context = useContext(depositModalContext)

  if (!context) {
    throw new Error('DepositModalContext must be used within its provider')
  }

  return context
}

export default useDepositModalState
