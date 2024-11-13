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
  UserRequestEvent,
  UserTrancheBalance,
} from '@solidant/kasu-sdk/src/services/UserLending/types'

import { LoanTicketDto } from '@/config/api.lendersAgreement'
import { LoanTicket, PendingDecision, PendingDecisionPool } from '@/utils'
import { DetailedTransaction } from '@/utils/lending/getDetailedTransactions'

import { PoolOverviewWithDelegate } from '@/types/page'

export type ModalBase = {
  isOpen: boolean
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
}

export type ModalAction =
  | { type: ModalsActionTypes.OPEN_MODAL; name: keyof Modals; content?: any }
  | { type: ModalsActionTypes.CLOSE_MODAL; name: keyof Modals }

export type ModalData<T = void> = T extends void ? ModalBase : T & ModalBase

export type Modals = {
  [ModalsKeys.LOYALTY_LEVELS]: ModalData
  [ModalsKeys.UNRELEASED_FEATURE]: ModalData
  [ModalsKeys.MISSING_EMAIL]: ModalData
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
  [ModalsKeys.OPT_OUT]: ModalData<{ loanTicket: LoanTicket; poolName: string }>
  [ModalsKeys.BORROWER_IDENTIFIED]: ModalData<{
    poolName: string
    loanTicket: LoanTicket
    callback: (newLoanTickets: LoanTicketDto[]) => void
  }>
  [ModalsKeys.PENDING_DECISIONS]: ModalData<{
    pendingDecisions: PendingDecision[]
    pools: PendingDecisionPool[]
  }>
  [ModalsKeys.REQUEST_DETAILS]: ModalData<{
    detailedTransaction: DetailedTransaction
  }>
  [ModalsKeys.LOAN_CONTRACT]: ModalData<{
    acceptLoanContract?: (contractSignature: string) => void
    generatedContract?: {
      contractMessage: string
      fullName: string
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
    transaction: {
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
    }
  }>
  [ModalsKeys.CANCEL_WITHDRAWAL]: ModalData<{
    transaction: {
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
    }
  }>
  [ModalsKeys.LEND]: ModalData<{
    pool: PoolOverview
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
