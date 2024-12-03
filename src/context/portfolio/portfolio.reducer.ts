import {
  PortfolioActions,
  PortfolioActionsTypes,
  PortfolioStateType,
} from '@/context/portfolio/portfolio.types'

const portfolioReducer = (
  state: PortfolioStateType,
  action: PortfolioActions
): PortfolioStateType => {
  switch (action.type) {
    case PortfolioActionsTypes.SET_FILTER:
      return {
        ...state,
        filter: {
          ...state.filter,
          [action.payload]: !state.filter[action.payload],
        },
      }
  }
}

export default portfolioReducer
