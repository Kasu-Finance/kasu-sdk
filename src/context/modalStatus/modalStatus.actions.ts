import { alpha, useTheme } from '@mui/material'
import { Dispatch, useMemo } from 'react'

import {
  ModalStatusAction,
  ModalStatusActions,
  ModalStatusActionsType,
  ModalStatusFunctions,
  ModalStatusParam,
  ModalStatusState,
} from '@/context/modalStatus/modalStatus.types'

const useModalStatusActions = (
  dispatch: Dispatch<ModalStatusActions>
): ModalStatusFunctions => {
  const theme = useTheme()

  return useMemo(
    () => ({
      setModalStatus: (modalStatus: ModalStatusParam) => {
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
          type: ModalStatusActionsType.SET_MODAL_STATUS_STATE,
          payload: newLockState,
        })
      },
      setModalStatusAction: (lockProgress: ModalStatusAction) => {
        dispatch({
          type: ModalStatusActionsType.SET_MODAL_STATUS_ACTON,
          payload: lockProgress,
        })
      },
    }),
    [dispatch, theme.palette]
  )
}

export default useModalStatusActions
