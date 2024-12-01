export enum LayoutTypes {
  CARD = 'CARD',
  TABLE = 'TABLE',
}

export enum HomeActionsTypes {
  SET_LAYOUT = 'SET_LAYOUT',
}

export type HomeActions = {
  type: HomeActionsTypes.SET_LAYOUT
  payload: LayoutTypes
}

export type HomeStateType = {
  layout: LayoutTypes | null
}

export type HomeFunctions = {
  setLayout: (layout: LayoutTypes) => void
}

export type HomeTypes = HomeStateType & HomeFunctions
