import { ReactNode } from 'react'

import Modal from '@/components/atoms/Modal'

type ConnectWalletModalProps = {
  trigger: ReactNode
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ trigger }) => {
  return <Modal trigger={trigger}>lol</Modal>
}

export default ConnectWalletModal
