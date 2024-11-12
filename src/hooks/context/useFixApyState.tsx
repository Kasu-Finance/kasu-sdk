import { useContext } from 'react'

import fixApyModalContext from '@/context/fixApyModal/fixApyModal.context'
import { FixApyModalTypes } from '@/context/fixApyModal/fixApyModal.types'

const useFixApyState = (): FixApyModalTypes => {
  const context = useContext(fixApyModalContext)

  if (!Object.keys(context).length) {
    throw new Error('FixApyModalContext must be used within its provider')
  }

  return context
}

export default useFixApyState
