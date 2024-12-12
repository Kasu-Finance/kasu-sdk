import { Dispatch, useMemo } from 'react'

import {
  ModalAction,
  ModalFunctions,
  ModalsActionTypes,
  ModalsKeys,
  OpenModalParam,
} from '@/context/modal/modal.types'

const useModalActions = (dispatch: Dispatch<ModalAction>): ModalFunctions =>
  useMemo(
    () => ({
      openModal: <T extends ModalsKeys>(args: OpenModalParam<T>) => {
        dispatch({
          type: ModalsActionTypes.OPEN_MODAL,
          name: args.name,
          isFullscreen: args.isFullscreen,
          content: args,
        })
      },
      closeModal: (name: ModalsKeys) => {
        dispatch({ type: ModalsActionTypes.CLOSE_MODAL, name })
      },
    }),
    [dispatch]
  )

export default useModalActions
