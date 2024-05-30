import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { UserLock } from '@solidant/kasu-sdk/src/services/Locking/types'
import { UserRequest } from '@solidant/kasu-sdk/src/services/UserLending/types'

import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

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
  DEPOSIT = 'depositModal',
  KYC = 'kycModal',
  CANCEL_DEPOSIT = 'cancelDepositModal',
  CANCEL_WITHDRAWAL = 'cancelWithdrawalModal',
  EARNINGS_CALCULATOR = 'earningsCalculatorModal',
}

export type ModalAction =
  | { type: ModalsActionTypes.OPEN_MODAL; name: keyof Modals; content?: any }
  | { type: ModalsActionTypes.CLOSE_MODAL; name: keyof Modals }

export type ModalData<T = void> = T extends void ? ModalBase : T & ModalBase

export type Modals = {
  [ModalsKeys.LOYALTY_LEVELS]: ModalData
  [ModalsKeys.LOCK]: ModalData
  [ModalsKeys.CONNECT_WALLET]: ModalData<{ callback?: () => void }>
  [ModalsKeys.UNLOCK]: ModalData<{ userLock: UserLock }>
  [ModalsKeys.WITHDRAW]: ModalData<{ poolOverview: PoolOverview }>
  [ModalsKeys.DEPOSIT]: ModalData<{
    poolData: PoolData
    initialAmount?: string
    initialTranche?: `0x${string}`
  }>
  [ModalsKeys.KYC]: ModalData<{ callback: () => void }>
  [ModalsKeys.CANCEL_DEPOSIT]: ModalData<{ transactionHistory: UserRequest }>
  [ModalsKeys.CANCEL_WITHDRAWAL]: ModalData<{ transactionHistory: UserRequest }>
  [ModalsKeys.EARNINGS_CALCULATOR]: ModalData<{
    poolData: PoolData
    poolOverview: PoolOverview
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
  openModal: <T extends keyof Modals>(args: OpenModalParam<T>) => void
  closeModal: (name: keyof Modals) => void
}
