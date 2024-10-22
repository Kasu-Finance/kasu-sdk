import { TrancheData } from '@solidant/kasu-sdk/src/services/DataService/types'
import {
  LockPeriod,
  UserLock,
} from '@solidant/kasu-sdk/src/services/Locking/types'
import {
  UserRequest,
  UserTrancheBalance,
} from '@solidant/kasu-sdk/src/services/UserLending/types'

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
  BORROWER_IDENTIGIED = 'borrowIdentifiedModal',
  UNRELEASED_FEATURE = 'unreleasedFeatureModal',
}

export type ModalAction =
  | { type: ModalsActionTypes.OPEN_MODAL; name: keyof Modals; content?: any }
  | { type: ModalsActionTypes.CLOSE_MODAL; name: keyof Modals }

export type ModalData<T = void> = T extends void ? ModalBase : T & ModalBase

export type Modals = {
  [ModalsKeys.LOYALTY_LEVELS]: ModalData
  [ModalsKeys.UNRELEASED_FEATURE]: ModalData
  [ModalsKeys.BORROWER_IDENTIGIED]: ModalData
  [ModalsKeys.LOAN_CONTRACT]: ModalData<{
    acceptLoanContract?: () => void
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
  [ModalsKeys.CANCEL_DEPOSIT]: ModalData<{ transactionHistory: UserRequest }>
  [ModalsKeys.CANCEL_WITHDRAWAL]: ModalData<{ transactionHistory: UserRequest }>
  [ModalsKeys.LEND]: ModalData<{
    pool: PoolOverviewWithDelegate
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
