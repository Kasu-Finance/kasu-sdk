'use client'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import DialogHeader from '@/components/molecules/DialogHeader'
import WalletList from '@/components/molecules/WalletList'

const ConnectWalletModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  return (
    <>
      <CustomCard>
        <DialogHeader title='Connect your wallet' onClose={handleClose} />

        <WaveBox variant='gold' px={2} py={3} borderRadius={2}>
          <WalletList activateCallback={handleClose} />
        </WaveBox>
      </CustomCard>
    </>
  )
}

export default ConnectWalletModal
