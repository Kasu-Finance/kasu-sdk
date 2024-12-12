'use client'

import {
  PoolOverview,
  TrancheData,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import {
  LockPeriod,
  UserLock,
} from '@solidant/kasu-sdk/src/services/Locking/types'
import {
  PortfolioLendingPool,
  PortfolioTranche,
} from '@solidant/kasu-sdk/src/services/Portfolio/types'
import {
  UserRequest,
  UserRequestEvent,
  UserTrancheBalance,
} from '@solidant/kasu-sdk/src/services/UserLending/types'
import { ReactNode, useReducer } from 'react'

import useModalActions from '@/context/modal/modal.actions'
import ModalContext from '@/context/modal/modal.context'
import { modalReducer } from '@/context/modal/modal.reducer'
import { Modals } from '@/context/modal/modal.types'

import { LoanTicket, PendingDecision } from '@/utils'
import { DetailedTransaction } from '@/utils/lending/getDetailedTransactions'

import { PoolOverviewWithDelegate } from '@/types/page'

const initialState: Modals = {
  connectWalletModal: { isOpen: false },
  loyaltyLevelsModal: { isOpen: false },
  missingEmailModal: { isOpen: false, callback: () => {} },
  fixedLoanModal: {
    isOpen: false,
    fixedLoans: null as unknown as PortfolioTranche['fixedLoans'],
  },
  withdrawFundsAtExpiryModal: {
    isOpen: false,
    fixedLoans: null as unknown as PortfolioTranche['fixedLoans'],
    pool: null as unknown as PortfolioLendingPool,
  },
  autoConversionToVariableModal: {
    isOpen: false,
    epochNumber: '',
    fixedLoans: null as unknown as PortfolioTranche['fixedLoans'],
  },
  fixApyModal: {
    isOpen: false,
    nextEpochTime: null as unknown as number,
    pool: null as unknown as PortfolioLendingPool & {
      selectedTranche: PortfolioTranche & {
        balanceData: UserTrancheBalance
      }
    },
  },
  borrowerIdentifiedModal: {
    isOpen: false,
    loanTicket: null as unknown as LoanTicket,
    poolName: '',
    callback: () => {},
  },
  optInModal: { isOpen: false },
  optOutModal: {
    isOpen: false,
    loanTicket: null as unknown as LoanTicket,
    poolName: '',
  },
  requestDetailsModal: {
    isOpen: false,
    detailedTransaction: null as unknown as DetailedTransaction,
    currentEpoch: '',
  },
  pendingDecisionsModal: {
    isOpen: false,
    pendingDecisions: null as unknown as PendingDecision[],
    pools: null as unknown as PoolOverview[],
  },
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
    currentEpoch: '',
    transaction: null as unknown as {
      apy: string
      fixedTermConfig: UserRequest['fixedTermConfig']
      timestamp: EpochTimeStamp
      lendingPool: {
        id: string
        name: string
        tranches: { orderId: string }[]
      }

      requestType: 'Deposit' | 'Withdrawal'
      events: UserRequestEvent[]
      nftId: string
      trancheName: string
    },
  },
  cancelWithdrawalModal: {
    isOpen: false,
    currentEpoch: '',
    transaction: null as unknown as {
      timestamp: EpochTimeStamp
      lendingPool: {
        id: string
        name: string
        tranches: { orderId: string }[]
      }
      requestType: 'Deposit' | 'Withdrawal'
      events: UserRequestEvent[]
      nftId: string
      trancheName: string
    },
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
    currentEpoch: '',
  },
  loanContractModal: {
    isOpen: false,
    isFullscreen: false,
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
