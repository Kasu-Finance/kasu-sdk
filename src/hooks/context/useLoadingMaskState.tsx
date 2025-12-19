import { useContext } from 'react'

import loadingMaskContext from '@/context/loadingMask/loadingMask.context'
import { LoadingMaskTypes } from '@/context/loadingMask/loadingMask.types'

const useLoadingMaskState = (): LoadingMaskTypes => {
  const context = useContext(loadingMaskContext)

  if (!Object.keys(context).length) {
    throw new Error('LoadingMaskContext must be used within its provider')
  }

  return context
}

export default useLoadingMaskState
