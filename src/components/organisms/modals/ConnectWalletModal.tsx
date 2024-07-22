'use client'

import { DialogContent } from '@mui/material'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'
import WalletList from '@/components/molecules/WalletList'

const ConnectWalletModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  return (
    <>
      <DialogHeader title='Connect wallet' onClose={handleClose} />
      <DialogContent>
        <WalletList activateCallback={handleClose} />
      </DialogContent>
    </>
  )
}

export default ConnectWalletModal
