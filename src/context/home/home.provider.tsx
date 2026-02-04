'use client'

import { ReactNode, useEffect, useReducer } from 'react'

import useHomeActions from '@/context/home/home.actions'
import HomeContext from '@/context/home/home.context'
import homeReducer from '@/context/home/home.reducer'
import { HomeStateType, LayoutTypes } from '@/context/home/home.types'
import { PortfolioSubgraphProvider } from '@/context/portfolioSubgraph'

type HomeStateProps = {
  children: ReactNode
}

const initialState: HomeStateType = {
  layout: null,
  totalPoolCount: 0,
  currentPage: 0,
}

const HomeState: React.FC<HomeStateProps> = ({ children }) => {
  const [state, dispatch] = useReducer(homeReducer, initialState)

  const homeActions = useHomeActions(dispatch)

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const displayLayout = localStorage.getItem('displayLayout')

      homeActions.setLayout((displayLayout as LayoutTypes) ?? LayoutTypes.CARD)
    }
  }, [homeActions])

  return (
    <HomeContext.Provider value={{ ...state, ...homeActions }}>
      <PortfolioSubgraphProvider>{children}</PortfolioSubgraphProvider>
    </HomeContext.Provider>
  )
}

export default HomeState
