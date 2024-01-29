import { useCallback, useContext } from 'react'

import { Toast, ToastTypes } from '@/context/toast/toastTypes'

import toastContext from './toastContext'

const useToastState = (): ToastTypes => {
  const context = useContext(toastContext)

  if (!Object.keys(context).length) {
    throw new Error('ToastContext must be used within its provider')
  }

  const { dispatch } = context

  const setToast = useCallback(
    (toast: Omit<Toast, 'removeToast'>) => {
      dispatch({
        type: 'SET_TOAST',
        payload: {
          ...toast,
          isClosable: toast.isClosable === undefined ? true : toast.isClosable,
        },
      })
    },
    [dispatch]
  )

  return {
    ...context,
    setToast,
    removeToast: () => dispatch({ type: 'REMOVE_TOAST' }),
  }
}

export default useToastState
