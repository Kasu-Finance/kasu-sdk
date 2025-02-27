'use client'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import WalletList from '@/components/molecules/WalletList'

import BaseLogo from '@/assets/logo/BaseLogo'

const ConnectWalletModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  return (
    <CustomCard>
      <DialogHeader
        title={
          <>
            Connect Your Wallet
            <BaseLogo />
          </>
        }
        titleProps={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
        onClose={handleClose}
      />
      <DialogContent>
        <WalletList />
      </DialogContent>
    </CustomCard>
  )
}

export default ConnectWalletModal
