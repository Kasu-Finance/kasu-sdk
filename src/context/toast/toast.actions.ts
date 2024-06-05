import { Dispatch, useMemo } from 'react'

import {
  Toast,
  ToastActions,
  ToastActionsType,
  ToastFunctions,
} from '@/context/toast/toast.types'

const useToastActions = (dispatch: Dispatch<ToastActions>): ToastFunctions =>
  useMemo(
    () => ({
      setToast: (toast: Omit<Toast, 'removeToast'>) => {
        dispatch({
          type: ToastActionsType.SET_TOAST,
          payload: {
            ...toast,
            isClosable:
              toast.isClosable === undefined ? true : toast.isClosable,
          },
        })
      },
      removeToast: () => dispatch({ type: ToastActionsType.REMOVE_TOAST }),
    }),
    [dispatch]
  )

export default useToastActions
