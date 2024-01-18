'use client'

import DialogWrapper from '@/components/atoms/DialogWrapper'
import LockModal from '@/components/organisms/modals/LockModal'
import LoyaltyLevelsModal from '@/components/organisms/modals/LoyaltyLevelsModal'

import { Modals } from '@/context/modal/modalTypes'
import useModalState from '@/context/modal/useModalState'

import ConnectWalletModal from './ConnectWalletModal'

type ModalDetails = {
  component: JSX.Element
  ariaLabel?: string
  ariaDescription?: string
}

export const getModal = (modalName: keyof Modals): ModalDetails | null => {
  switch (modalName) {
    case 'connectWalletModal':
      return {
        component: <ConnectWalletModal />,
        ariaLabel: 'Connect Wallet Modal',
        ariaDescription: 'List of available web3 wallet connections',
      }
    case 'loyaltyLevelsModal':
      return {
        component: <LoyaltyLevelsModal />,
        ariaLabel: 'Loyalty Levels',
        ariaDescription: 'Information about loyalty levels',
      }
    case 'lockModal':
      return {
        component: <LockModal />,
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
