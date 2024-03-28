import { alpha, useTheme } from '@mui/material'
import { useCallback, useContext } from 'react'

import modalStatusContext from '@/context/modalStatus/modalStatus.context'
import {
  ModalStatusAction,
  ModalStatusParam,
  ModalStatusState,
  ModalStatusTypes,
} from '@/context/modalStatus/modalStatus.types'

const useModalStatusState = (): ModalStatusTypes => {
  const context = useContext(modalStatusContext)

  const theme = useTheme()

  if (!Object.keys(context).length) {
    throw new Error('LockModalContext must be used within its provider')
  }

  const { dispatch } = context

  const setModalStatus = useCallback(
    (modalStatus: ModalStatusParam) => {
      let newLockState: ModalStatusState = {
        type: 'default',
        bgColor: undefined,
      }

      if (modalStatus.type !== 'default') {
        newLockState = {
          ...modalStatus,
          bgColor: alpha(
            theme.palette[
              ['error', 'success'].includes(modalStatus.type)
                ? (modalStatus.type as 'success' | 'error')
                : 'primary'
            ].main,
            0.04
          ),
        }
      }

      dispatch({
        type: 'SET_MODAL_STATUS_STATE',
        payload: newLockState,
      })
    },
    [dispatch, theme.palette]
  )

  const setModalStatusAction = useCallback(
    (lockProgress: ModalStatusAction) => {
      dispatch({ type: 'SET_MODAL_STATUS_ACTON', payload: lockProgress })
    },
    [dispatch]
  )

  return {
    ...context,
    setModalStatus,
    setModalStatusAction,
  }
}

export default useModalStatusState
