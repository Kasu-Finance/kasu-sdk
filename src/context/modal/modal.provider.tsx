'use client'

import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'
import { ReactNode, useReducer } from 'react'

import useModalActions from '@/context/modal/modal.actions'
import ModalContext from '@/context/modal/modal.context'
import { modalReducer } from '@/context/modal/modal.reducer'
import { Modals } from '@/context/modal/modal.types'

import { PoolData } from '@/utils/lending/getPoolData'

const initialState: Modals = {
  connectWalletModal: { isOpen: false },
  loyaltyLevelsModal: { isOpen: false },
  termsAndConditionsModal: { isOpen: false },
  lockModal: { isOpen: false },
  unreleasedFeatureModal: { isOpen: false },
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

  const modalActions = useModalActions(dispatch)

  return (
    <ModalContext.Provider
      value={{
        modal,
        ...modalActions,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export default ModalState
