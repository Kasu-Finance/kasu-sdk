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
  PortfolioTrancheDepositDetails,
} from '@solidant/kasu-sdk/src/services/Portfolio/types'
import {
  UserRequest,
  UserTrancheBalance,
} from '@solidant/kasu-sdk/src/services/UserLending/types'

import { LoanStatus } from '@/components/organisms/lending/RepaymentsTab/LoanStatus/LoanStatusTableBody'
import {
  ExemptLoanContract,
  RetailLoanContract,
} from '@/components/organisms/modals/LoanContractModal/contract.type'

import { LoanTicketDto } from '@/config/api.lendersAgreement'
import { PendingDecision, PendingDecisionPool } from '@/utils'
import {
  DetailedTransactionReallocationRequest,
  DetailedTransactionWrapper,
} from '@/utils/lending/getDetailedTransactions'
import { WithdrawalTransactionWrapper } from '@/utils/lending/getWithdrawalTransactions'

import { PoolOverviewWithDelegate } from '@/types/page'

export type ModalBase = {
  isOpen: boolean
  isFullscreen?: boolean
}

export enum ModalsActionTypes {
  OPEN_MODAL = 'OPEN_MODAL',
  CLOSE_MODAL = 'CLOSE_MODAL',
}

export enum ModalsKeys {
  CONNECT_WALLET = 'connectWalletModal',
  LOYALTY_LEVELS = 'loyaltyLevelsModal',
  LOCK = 'lockModal',
  UNLOCK = 'unlockModal',
  WITHDRAW = 'withdrawModal',
  KYC = 'kycModal',
  CANCEL_DEPOSIT = 'cancelDepositModal',
  CANCEL_WITHDRAWAL = 'cancelWithdrawalModal',
  LEND = 'lendModal',
  LOAN_CONTRACT = 'loanContractModal',
  BORROWER_IDENTIFIED = 'borrowerIdentifiedModal',
  OPT_IN = 'optInModal',
  OPT_OUT = 'optOutModal',
  REQUEST_DETAILS = 'requestDetailsModal',
  PENDING_DECISIONS = 'pendingDecisionsModal',
  FIXED_LOAN = 'fixedLoanModal',
  WITHDRAW_FUNDS_AT_EXPIRY = 'withdrawFundsAtExpiryModal',
  AUTO_CONVERSION_TO_VARIABLE = 'autoConversionToVariableModal',
  FIX_APY = 'fixApyModal',
  MISSING_EMAIL = 'missingEmailModal',
  UNRELEASED_FEATURE = 'unreleasedFeatureModal',
  HISTORICAL_REPAYMENTS = 'historicalRepaymentsModal',
  WIP_REDIRECT = 'wipRedirectModal',
  VIEW_LOAN_CONTRACTS = 'viewLoanContractsModal',
}

export type ModalAction =
  | {
      type: ModalsActionTypes.OPEN_MODAL
      name: keyof Modals
      content?: any
      isFullscreen?: boolean
    }
  | { type: ModalsActionTypes.CLOSE_MODAL; name: keyof Modals }

export type ModalData<T = void> = T extends void ? ModalBase : T & ModalBase

export type Modals = {
  [ModalsKeys.UNRELEASED_FEATURE]: ModalData
  [ModalsKeys.WIP_REDIRECT]: ModalData
  [ModalsKeys.VIEW_LOAN_CONTRACTS]: ModalData<{
    depositDetails: PortfolioTrancheDepositDetails[]
  }>
  [ModalsKeys.LOYALTY_LEVELS]: ModalData<{
    callback?: () => void
  }>
  [ModalsKeys.MISSING_EMAIL]: ModalData<{
    callback: () => void
  }>
  [ModalsKeys.WITHDRAW_FUNDS_AT_EXPIRY]: ModalData<{
    pool: PortfolioLendingPool
    fixedLoans: PortfolioTranche['fixedLoans']
  }>
  [ModalsKeys.AUTO_CONVERSION_TO_VARIABLE]: ModalData<{
    epochNumber: string
    fixedLoans: PortfolioTranche['fixedLoans']
  }>
  [ModalsKeys.FIX_APY]: ModalData<{
    pool: PortfolioLendingPool & {
      selectedTranche: PortfolioTranche & { balanceData: UserTrancheBalance }
    }
    nextEpochTime: number
  }>
  [ModalsKeys.FIXED_LOAN]: ModalData<{
    fixedLoans: PortfolioTranche['fixedLoans']
  }>
  [ModalsKeys.OPT_IN]: ModalData
  [ModalsKeys.OPT_OUT]: ModalData<{
    subsequentTransaction: {
      amount: number
      timestamp: EpochTimeStamp
      endBorrowerID: string
      poolID: string
      trancheID: string
    }
    poolName: string
  }>
  [ModalsKeys.BORROWER_IDENTIFIED]: ModalData<{
    poolName: string
    subsequentTransaction: {
      amount: number
      timestamp: EpochTimeStamp
      endBorrowerID: string
      poolID: string
      trancheID: string
    }
    callback: (newLoanTickets: LoanTicketDto[]) => void
  }>
  [ModalsKeys.PENDING_DECISIONS]: ModalData<{
    pendingDecisions: PendingDecision[]
    pools: PendingDecisionPool[]
  }>
  [ModalsKeys.REQUEST_DETAILS]: ModalData<{
    detailedTransaction:
      | DetailedTransactionWrapper
      | DetailedTransactionReallocationRequest
      | WithdrawalTransactionWrapper
    currentEpoch: string
  }>
  [ModalsKeys.LOAN_CONTRACT]: ModalData<{
    acceptLoanContract?: (contractSignature: string) => void
    generatedContract?: {
      contractMessage: string
      formattedMessage: RetailLoanContract | ExemptLoanContract
      fullName: string
      contractType: 'retail' | 'exempt'
      contractVersion: number
      createdAt: EpochTimeStamp
    }
    canAccept: boolean
  }>
  [ModalsKeys.CONNECT_WALLET]: ModalData<{ callback?: () => void }>
  [ModalsKeys.LOCK]: ModalData<{ lockPeriods: LockPeriod[] }>
  [ModalsKeys.UNLOCK]: ModalData<{
    userLock: UserLock
    lockPeriods: LockPeriod[]
  }>
  [ModalsKeys.WITHDRAW]: ModalData<{
    pool: PoolOverviewWithDelegate
    trancheBalance: (TrancheData & { balanceData: UserTrancheBalance })[]
  }>
  [ModalsKeys.KYC]: ModalData<{ callback: () => void }>
  [ModalsKeys.CANCEL_DEPOSIT]: ModalData<{
    currentEpoch: string
    transaction: {
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
    }
  }>
  [ModalsKeys.CANCEL_WITHDRAWAL]: ModalData<{
    currentEpoch: string
    transaction: {
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
    }
  }>
  [ModalsKeys.LEND]: ModalData<{
    pool: PoolOverview
    currentEpoch: string
  }>
  [ModalsKeys.HISTORICAL_REPAYMENTS]: ModalData<{
    historicalRepayments: LoanStatus['historicalRepayments']
  }>
}

export type OpenModalParam<T extends keyof Modals> = Omit<
  Modals[T],
  'isOpen'
> & {
  name: T
}

export type ModalStateType = {
  modal: Modals
}

export type ModalFunctions = {
  openModal: <T extends keyof Modals>(args: OpenModalParam<T>) => void
  closeModal: (name: keyof Modals) => void
}

export type ModalTypes = ModalStateType & ModalFunctions
