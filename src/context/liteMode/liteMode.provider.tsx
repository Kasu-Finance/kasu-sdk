'use client'

import React, { PropsWithChildren, useEffect, useReducer } from 'react'

import useLiteModeActions from '@/context/liteMode/liteMode.actions'
import LiteModeContext from '@/context/liteMode/liteMode.context'
import liteModeReducer from '@/context/liteMode/liteMode.reducer'
import { LiteModeStateType } from '@/context/liteMode/liteMode.types'

const initialState: LiteModeStateType = {
  isLiteMode: undefined,
}

const LiteModeState: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(liteModeReducer, initialState)

  const liteModeActions = useLiteModeActions(dispatch)

  useEffect(() => {
    if (
      typeof localStorage !== 'undefined' &&
      typeof state.isLiteMode === 'undefined'
    ) {
      const isLiteMode = localStorage.getItem('KASU_IS_LITE_MODE')

      if (!isLiteMode) {
        localStorage.setItem('KASU_IS_LITE_MODE', 'true')
        return
      }

      liteModeActions.setLiteMode(isLiteMode === 'true')
    }
  }, [liteModeActions, state.isLiteMode])

  return (
    <LiteModeContext.Provider value={{ ...state, ...liteModeActions }}>
      {children}
    </LiteModeContext.Provider>
  )
}

export default LiteModeState
