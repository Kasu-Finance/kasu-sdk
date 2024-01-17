export type ModalBase = {
  isOpen: boolean
}

export type ModalData<T = void> = T extends void ? ModalBase : T & ModalBase

export type Modals = {
  waitingModal: ModalData
  errorModal: ModalData
  warningModal: ModalData
  successModal: ModalData<{
    txHash?: string
  }>
  connectWalletModal: ModalData
  loyaltyLevelsModal: ModalData
}

export type ModalWithProps = Extract<keyof Modals, 'successModal'>

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
