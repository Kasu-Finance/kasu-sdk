'use client'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import WalletList from '@/components/molecules/WalletList'

const ConnectWalletModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  return (
    <CustomCard>
      <DialogHeader title='Connect your wallet' onClose={handleClose} />
      <DialogContent>
        <WalletList activateCallback={handleClose} />
      </DialogContent>
    </CustomCard>
  )
}

export default ConnectWalletModal
