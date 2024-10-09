'use client'

import { TrancheData } from '@solidant/kasu-sdk/src/services/DataService/types'
import {
  LockPeriod,
  UserLock,
} from '@solidant/kasu-sdk/src/services/Locking/types'
import {
  UserRequest,
  UserTrancheBalance,
} from '@solidant/kasu-sdk/src/services/UserLending/types'
import { ReactNode, useReducer } from 'react'

import useModalActions from '@/context/modal/modal.actions'
import ModalContext from '@/context/modal/modal.context'
import { modalReducer } from '@/context/modal/modal.reducer'
import { Modals } from '@/context/modal/modal.types'

import { PoolOverviewWithDelegate } from '@/types/page'

const initialState: Modals = {
  connectWalletModal: { isOpen: false },
  loyaltyLevelsModal: { isOpen: false },
  lockModal: { isOpen: false, lockPeriods: null as unknown as LockPeriod[] },
  unreleasedFeatureModal: { isOpen: false },
  withdrawModal: {
    isOpen: false,
    pool: null as unknown as PoolOverviewWithDelegate,
    trancheBalance: null as unknown as (TrancheData & {
      balanceData: UserTrancheBalance
    })[],
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
    lockPeriods: null as unknown as LockPeriod[],
  },
  kycModal: {
    isOpen: false,
    callback: () => {},
  },
  lendModal: {
    isOpen: false,
    pool: null as unknown as PoolOverviewWithDelegate,
  },
  loanContractModal: {
    isOpen: false,
    canAccept: false,
    acceptLoanContract: () => {},
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
