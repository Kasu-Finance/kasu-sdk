'use client'

import { ReactNode, useReducer } from 'react'

import ModalStatusContext from '@/context/modalStatus/modalStatus.context'
import modalStatusReducer from '@/context/modalStatus/modalStatus.reducer'
import {
  ModalStatusAction,
  ModalStatusStateType,
} from '@/context/modalStatus/modalStatus.types'

type ModalStatusStateProps = {
  children: ReactNode
}

const initialState: ModalStatusStateType = {
  modalStatus: {
    type: 'default',
    bgColor: undefined,
  },
  modalStatusAction: ModalStatusAction.EDITING,
}

const ModalStatusState: React.FC<ModalStatusStateProps> = ({ children }) => {
  const [state, dispatch] = useReducer(modalStatusReducer, initialState)

  return (
    <ModalStatusContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ModalStatusContext.Provider>
  )
}

export default ModalStatusState
