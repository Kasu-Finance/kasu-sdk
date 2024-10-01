'use client'

import { ReactNode, useReducer } from 'react'

import useModalStatusActions from '@/context/modalStatus/modalStatus.actions'
import ModalStatusContext from '@/context/modalStatus/modalStatus.context'
import modalStatusReducer from '@/context/modalStatus/modalStatus.reducer'
import { ModalStatusStateType } from '@/context/modalStatus/modalStatus.types'

type ModalStatusStateProps = {
  children: ReactNode
}

const ModalStatusState: React.FC<ModalStatusStateProps> = ({ children }) => {
  const initialState: ModalStatusStateType = {
    modalStatus: {
      type: 'default',
      bgColor: undefined,
    },
  }

  const [state, dispatch] = useReducer(modalStatusReducer, initialState)

  const modalStatusActions = useModalStatusActions(dispatch)

  return (
    <ModalStatusContext.Provider value={{ ...state, ...modalStatusActions }}>
      {children}
    </ModalStatusContext.Provider>
  )
}

export default ModalStatusState
