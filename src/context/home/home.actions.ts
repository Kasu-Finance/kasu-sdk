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
    }),
    [dispatch]
  )

export default useHomeActions
