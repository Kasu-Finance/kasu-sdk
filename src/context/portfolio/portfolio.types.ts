export enum PortfolioActionsTypes {
  SET_FILTER = 'SET_FILTER',
}

export type PortfolioFilterTypes = 'activePools' | 'closedPools'

export type PortfolioActions = {
  type: PortfolioActionsTypes.SET_FILTER
  payload: PortfolioFilterTypes
}

export type PortfolioStateType = {
  filter: {
    activePools: boolean
    closedPools: boolean
  }
}

export type PortfolioFunctions = {
  setFilter: (filter: PortfolioFilterTypes) => void
}

export type PortfolioTypes = PortfolioStateType & PortfolioFunctions
