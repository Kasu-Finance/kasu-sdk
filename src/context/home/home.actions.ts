import { Dispatch, useMemo } from 'react'

import {
  HomeActions,
  HomeActionsTypes,
  HomeFunctions,
  LayoutTypes,
} from '@/context/home/home.types'

const useHomeActions = (dispatch: Dispatch<HomeActions>): HomeFunctions =>
  useMemo(
    () => ({
      setLayout: (layout: LayoutTypes) => {
        localStorage.setItem('displayLayout', layout)

        dispatch({
          type: HomeActionsTypes.SET_LAYOUT,
          payload: layout,
        })
      },
      setCurrentPage: (currentPage: number) =>
        dispatch({
          type: HomeActionsTypes.SET_CURRENT_PAGE,
          payload: currentPage,
        }),
      setTotalPoolCount: (totalPoolCount: number) =>
        dispatch({
          type: HomeActionsTypes.SET_TOTAL_POOL_COUNT,
          payload: totalPoolCount,
        }),
    }),
    [dispatch]
  )

export default useHomeActions
