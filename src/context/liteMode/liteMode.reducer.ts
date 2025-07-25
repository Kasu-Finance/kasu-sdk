import {
  LiteModeActions,
  LiteModeActionType,
  LiteModeStateType,
} from '@/context/liteMode/liteMode.types'

const liteModeReducer = (
  state: LiteModeStateType,
  action: LiteModeActions
): LiteModeStateType => {
  switch (action.type) {
    case LiteModeActionType.TOGGLE_LITE_MODE:
      localStorage.setItem('KASU_IS_LITE_MODE', (!state.isLiteMode).toString())

      return {
        ...state,
        isLiteMode: !state.isLiteMode,
      }
    case LiteModeActionType.SET_LITE_MODE:
      localStorage.setItem('KASU_IS_LITE_MODE', action.payload.toString())

      return {
        ...state,
        isLiteMode: action.payload,
      }
  }
}

export default liteModeReducer
