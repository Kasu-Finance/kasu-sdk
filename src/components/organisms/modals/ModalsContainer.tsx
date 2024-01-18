import LockModal from '@/components/organisms/modals/LockModal'
import LoyaltyLevelsModal from '@/components/organisms/modals/LoyaltyLevelsModal'

import ConnectWalletModal from './ConnectWalletModal'

const ModalsContainer = () => (
  <>
    <ConnectWalletModal />
    <LoyaltyLevelsModal />
    <LockModal />
  </>
)

export default ModalsContainer
