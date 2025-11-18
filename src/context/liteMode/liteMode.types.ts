export enum LiteModeActionType {
  TOGGLE_LITE_MODE = 'TOGGLE_LITE_MODE',
  SET_LITE_MODE = 'SET_LITE_MODE',
}

export type LiteModeActions =
  | {
      type: LiteModeActionType.TOGGLE_LITE_MODE
    }
  | {
      type: LiteModeActionType.SET_LITE_MODE
      payload: boolean
    }

export type LiteModeStateType = {
  isLiteMode: boolean | undefined
}

export type LiteModeFunctions = {
  toggleLiteMode: () => void
  setLiteMode: (isLiteMode: boolean) => void
}

export type LiteModeTypes = LiteModeStateType & LiteModeFunctions
