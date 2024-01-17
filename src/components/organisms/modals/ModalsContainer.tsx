import { memo } from 'react'

import LoyaltyLevelsModal from '@/components/organisms/modals/LoyaltyLevelsModal'

import ConnectWalletModal from './ConnectWalletModal'

const ModalsContainer = memo(() => (
  <>
    <ConnectWalletModal />
    <LoyaltyLevelsModal />
  </>
))

export default ModalsContainer
