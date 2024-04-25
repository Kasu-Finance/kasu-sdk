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
  TRANSACTION_PROCESSING = 'transactionProcessingModal',
  DEPOSIT = 'depositModal',
  KYC = 'kycModal',
}

export type ModalAction =
  | { type: ModalsActionTypes.OPEN_MODAL; name: keyof Modals; content?: any }
  | { type: ModalsActionTypes.CLOSE_MODAL; name: keyof Modals }

export type ModalData<T = void> = T extends void ? ModalBase : T & ModalBase

export type Modals = {
  connectWalletModal: ModalData
  loyaltyLevelsModal: ModalData
  lockModal: ModalData
  unlockModal: ModalData<{ userLock: UserLock }>
  withdrawModal: ModalData<{ poolData: PoolOverview }>
  transactionProcessingModal: ModalData
  depositModal: ModalData<{ poolData: PoolData }>
  kycModal: ModalData<{ callback: () => void }>
  cancelDepositModal: ModalData<{ transactionHistory: UserRequest }>
  cancelWithdrawalModal: ModalData<{ transactionHistory: UserRequest }>
}

export type ModalWithProps = Extract<
  keyof Modals,
  | 'connectWalletModal'
  | 'loyaltyLevelsModal'
  | 'lockModal'
  | 'unlockModal'
  | 'withdrawModal'
  | 'transactionProcessingModal'
  | 'depositModal'
  | 'kycModal'
  | 'cancelDepositModal'
  | 'cancelWithdrawalModal'
>

export type OpenModalWithProps<T extends keyof Modals> = Omit<
  Modals[T],
  'isOpen'
> & {
  name: ModalWithProps
}

export type OpenModalWithoutProps<T extends keyof Modals> = {
  name: T
}

export type OpenModalParam<T extends keyof Modals> = T extends ModalWithProps
  ? OpenModalWithProps<T>
  : OpenModalWithoutProps<T>

export type ModalStateType = {
  modal: Modals
  openModal: <T extends keyof Modals>(args: OpenModalParam<T>) => void
  closeModal: (name: keyof Modals) => void
}
