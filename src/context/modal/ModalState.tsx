'use client'

import React, { ReactNode, useCallback, useState } from 'react'

import ModalContext from './modalContext'
import { Modals, OpenModalParam } from './modalTypes'

type Props = {
  children: ReactNode
}

const initialState: Modals = {
  waitingModal: { isOpen: false },
  errorModal: { isOpen: false },
  warningModal: { isOpen: false },
  successModal: { isOpen: false, txHash: undefined },
  connectWalletModal: { isOpen: false },
  loyaltyLevelsModal: { isOpen: false },
  lockModal: { isOpen: false },
}

const ModalState: React.FC<Props> = ({ children }) => {
  const [modal, setModal] = useState(initialState)

  const openModal = useCallback(
    <T extends keyof Modals>(args: OpenModalParam<T>) => {
      const { name, ...rest } = args

      setModal((prev) => ({
        ...prev,
        [name]: {
          isOpen: true,
          ...rest,
        },
      }))
    },
    []
  )

  const closeModal = useCallback((name: keyof Modals): void => {
    setModal((prev) => ({
      ...prev,
      [name]: initialState[name],
    }))
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
