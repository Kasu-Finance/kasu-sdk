import { alpha, useTheme } from '@mui/material'
import { useCallback, useContext } from 'react'

import { LockState } from '@/context/lockModal/lockModal.types'
import modalStatusContext from '@/context/modalStatus/modalStatus.context'
import {
  ModalStatusAction,
  ModalStatusParam,
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
    (lockState: ModalStatusParam) => {
      let newLockState: LockState = { type: 'default', bgColor: undefined }

      if (lockState.type !== 'default') {
        newLockState = {
          ...lockState,
          bgColor: alpha(
            theme.palette[
              ['error', 'success'].includes(lockState.type)
                ? (lockState.type as 'success' | 'error')
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
