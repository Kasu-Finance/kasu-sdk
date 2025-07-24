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
  UserTrancheBalance,
} from '@solidant/kasu-sdk/src/services/UserLending/types'
import { ReactNode, useReducer } from 'react'

import { LoanStatus } from '@/components/organisms/lending/RepaymentsTab/LoanStatus/LoanStatusTableBody'

import useModalActions from '@/context/modal/modal.actions'
import ModalContext from '@/context/modal/modal.context'
import { modalReducer } from '@/context/modal/modal.reducer'
import { Modals } from '@/context/modal/modal.types'

import { PendingDecision } from '@/utils'
import { DetailedTransactionWrapper } from '@/utils/lending/getDetailedTransactions'

import { PoolOverviewWithDelegate } from '@/types/page'

const initialState: Modals = {
  loyaltyLevelsModal: { isOpen: false },
  referralModal: { isOpen: false },
  wipRedirectModal: { isOpen: false },
  linkWalletsModal: { isOpen: false },
  referredUsersModal: { isOpen: false, referredUsers: [] },
  referralDetectedModal: { isOpen: false, referralCode: '' as `0x${string}` },
  viewWalletModal: { isOpen: false },
  missingEmailModal: { isOpen: false, callback: () => {} },
  viewLoanContractsModal: {
    isOpen: false,
    depositDetails: [],
  },
  historicalRepaymentsModal: {
    isOpen: false,
    historicalRepayments: null as unknown as LoanStatus['historicalRepayments'],
  },
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
    subsequentTransaction: null as unknown as {
      amount: number
      timestamp: EpochTimeStamp
      endBorrowerID: string
      poolID: string
      trancheID: string
    },
    poolName: '',
    callback: () => {},
  },
  optInModal: { isOpen: false },
  optOutModal: {
    isOpen: false,
    subsequentTransaction: null as unknown as {
      amount: number
      timestamp: EpochTimeStamp
      endBorrowerID: string
      poolID: string
      trancheID: string
    },
    poolName: '',
  },
  requestDetailsModal: {
    isOpen: false,
    detailedTransaction: null as unknown as DetailedTransactionWrapper,
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
      amount: string
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
      amount: string
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
    currentEpochDepositedAmount: new Map(),
    currentEpochFtdAmount: new Map(),
  },
  loanContractModal: {
    isOpen: false,
    isFullscreen: false,
    canAccept: false,
    acceptLoanContract: () => {},
  },
  nftDetectedModal: {
    isOpen: false,
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
