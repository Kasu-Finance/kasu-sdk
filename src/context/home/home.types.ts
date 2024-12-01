export enum LayoutTypes {
  CARD = 'CARD',
  TABLE = 'TABLE',
}

export enum HomeActionsTypes {
  SET_LAYOUT = 'SET_LAYOUT',
  SET_TOTAL_POOL_COUNT = 'SET_TOTAL_POOL_COUNT',
  SET_CURRENT_PAGE = 'SET_CURRENT_PAGE',
}

export type HomeActions =
  | {
      type: HomeActionsTypes.SET_LAYOUT
      payload: LayoutTypes
    }
  | {
      type: HomeActionsTypes.SET_TOTAL_POOL_COUNT
      payload: number
    }
  | {
      type: HomeActionsTypes.SET_CURRENT_PAGE
      payload: number
    }

export type HomeStateType = {
  layout: LayoutTypes | null
  totalPoolCount: number
  currentPage: number
}

export type HomeFunctions = {
  setLayout: (layout: LayoutTypes) => void
  setTotalPoolCount: (totalPoolCount: number) => void
  setCurrentPage: (page: number) => void
}

export type HomeTypes = HomeStateType & HomeFunctions
