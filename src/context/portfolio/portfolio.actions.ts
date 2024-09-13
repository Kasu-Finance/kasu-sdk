import { Dispatch, useMemo } from 'react'

import {
  PortfolioActions,
  PortfolioActionsTypes,
  PortfolioFilterTypes,
  PortfolioFunctions,
} from '@/context/portfolio/portfolio.types'

const usePortfolioActions = (
  dispatch: Dispatch<PortfolioActions>
): PortfolioFunctions =>
  useMemo(
    () => ({
      setFilter: (filter: PortfolioFilterTypes) =>
        dispatch({
          type: PortfolioActionsTypes.SET_FILTER,
          payload: filter,
        }),
    }),
    [dispatch]
  )

export default usePortfolioActions
