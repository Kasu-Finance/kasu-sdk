import { Dispatch, useMemo } from 'react'

import {
  LiteModeActions,
  LiteModeActionType,
  LiteModeFunctions,
} from '@/context/liteMode/liteMode.types'

const useLiteModeActions = (
  dispatch: Dispatch<LiteModeActions>
): LiteModeFunctions =>
  useMemo(
    () => ({
      toggleLiteMode: () =>
        dispatch({ type: LiteModeActionType.TOGGLE_LITE_MODE }),
      setLiteMode: (isLiteMode: boolean) =>
        dispatch({
          type: LiteModeActionType.SET_LITE_MODE,
          payload: isLiteMode,
        }),
    }),
    [dispatch]
  )

export default useLiteModeActions
