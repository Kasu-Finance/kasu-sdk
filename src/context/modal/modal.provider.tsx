'use client'

import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { ReactNode, useCallback, useReducer } from 'react'

import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

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
  termsAndConditionsModal: { isOpen: false },
  lockModal: { isOpen: false },
  withdrawModal: {
    isOpen: false,
    poolOverview: null as unknown as PoolOverview,
  },
  cancelDepositModal: {
    isOpen: false,
    transactionHistory: null as unknown as UserRequest,
  },
  cancelWithdrawalModal: {
    isOpen: false,
    transactionHistory: null as unknown as UserRequest,
  },
  unlockModal: {
    isOpen: false,
    userLock: null as unknown as UserLock,
  },
  depositModal: {
    isOpen: false,
    poolData: null as unknown as PoolData,
  },
  kycModal: {
    isOpen: false,
    callback: () => {},
  },
  earningsCalculatorModal: {
    isOpen: false,
    poolData: null as unknown as PoolData,
    poolOverview: null as unknown as PoolOverview,
  },
}

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
