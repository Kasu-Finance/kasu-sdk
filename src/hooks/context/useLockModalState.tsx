import { useContext } from 'react'

import lockModalContext from '@/context/lockModal/lockModal.context'
import { LockModalTypes } from '@/context/lockModal/lockModal.types'

const useLockModalState = (): LockModalTypes => {
  const context = useContext(lockModalContext)

  if (!Object.keys(context).length) {
    throw new Error('LockModalContext must be used within its provider')
  }

  return context
}

export default useLockModalState
