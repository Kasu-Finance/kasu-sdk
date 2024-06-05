import { useContext } from 'react'

import modalStatusContext from '@/context/modalStatus/modalStatus.context'
import { ModalStatusTypes } from '@/context/modalStatus/modalStatus.types'

const useModalStatusState = (): ModalStatusTypes => {
  const context = useContext(modalStatusContext)

  if (!Object.keys(context).length) {
    throw new Error('LockModalContext must be used within its provider')
  }

  return context
}

export default useModalStatusState
