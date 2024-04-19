'use client'

import React, { ReactNode, useCallback, useReducer } from 'react'

import ModalContext from '@/context/modal/modal.context'
import { modalReducer } from '@/context/modal/modal.reducer'
import {
  Modals,
  ModalsActionTypes,
  OpenModalParam,
} from '@/context/modal/modal.types'

const initialState: Modals = {
  connectWalletModal: { isOpen: false },
  loyaltyLevelsModal: { isOpen: false },
  lockModal: { isOpen: false },
  depositModal: { isOpen: false },
  unlockModal: { isOpen: false },
  cancelDepositModal: { isOpen: false },
  cancelWithdrawalModal: { isOpen: false },
  kycModal: { isOpen: false },
} as Modals

const ModalState: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modal, dispatch] = useReducer(modalReducer, initialState)

  const openModal = useCallback(
    <T extends keyof Modals>(args: OpenModalParam<T>) => {
      dispatch({
        type: ModalsActionTypes.OPEN_MODAL,
        name: args.name,
        content: args,
      })
    },
    []
  )

  const closeModal = useCallback((name: keyof Modals) => {
    dispatch({ type: ModalsActionTypes.CLOSE_MODAL, name })
  }, [])

  return (
    <ModalContext.Provider
      value={{
        modal,
        openModal,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export default ModalState
