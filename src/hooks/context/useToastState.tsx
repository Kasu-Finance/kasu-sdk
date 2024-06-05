import { useContext } from 'react'

import toastContext from '@/context/toast/toast.context'
import { ToastTypes } from '@/context/toast/toast.types'

const useToastState = (): ToastTypes => {
  const context = useContext(toastContext)

  if (!Object.keys(context).length) {
    throw new Error('ToastContext must be used within its provider')
  }
  return context
}

export default useToastState
