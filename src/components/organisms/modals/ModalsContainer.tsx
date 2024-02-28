'use client'

import useModalState from '@/hooks/context/useModalState'

import DialogWrapper from '@/components/atoms/DialogWrapper'
import LockModalWrapper from '@/components/organisms/modals/LockModal/LockModalWrapper'
import LoyaltyLevelsModal from '@/components/organisms/modals/LoyaltyLevelsModal'

import { Modals } from '@/context/modal/modal.types'

import ConnectWalletModal from './ConnectWalletModal'

type ModalDetails = {
  component: JSX.Element
  ariaLabel?: string
  ariaDescription?: string
}

export const getModal = (
  modalName: keyof Modals,
  handleClose: () => void
): ModalDetails | null => {
  switch (modalName) {
    case 'connectWalletModal':
      return {
        component: <ConnectWalletModal handleClose={handleClose} />,
        ariaLabel: 'Connect Wallet Modal',
        ariaDescription: 'List of available web3 wallet connections',
      }
    case 'loyaltyLevelsModal':
      return {
        component: <LoyaltyLevelsModal handleClose={handleClose} />,
        ariaLabel: 'Loyalty Levels',
        ariaDescription: 'Information about loyalty levels',
      }
    case 'lockModal':
      return {
        component: <LockModalWrapper handleClose={handleClose} />,
      }
    default:
      return null
  }
}

const ModalsContainer = () => {
  const { modal } = useModalState()

  return (
    <>
      {Object.keys(modal).map((modalName) => (
        <DialogWrapper key={modalName} modalName={modalName as keyof Modals} />
      ))}
    </>
  )
}

export default ModalsContainer
