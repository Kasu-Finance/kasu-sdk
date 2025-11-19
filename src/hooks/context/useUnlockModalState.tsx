import { useContext } from 'react'

import unlockModalContext from '@/context/unlockModal/unlockModal.context'
import { UnlockModalTypes } from '@/context/unlockModal/unlockModal.types'

const useUnlockModalState = (): UnlockModalTypes => {
  const context = useContext(unlockModalContext)

  if (!Object.keys(context).length) {
    throw new Error('UnlockModalContext must be used within its provider')
  }

  return context
}

export default useUnlockModalState
