'use client'

import { useLoginWithEmail, usePrivy, useWallets } from '@privy-io/react-auth'
import { useState } from 'react'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'

import BaseLogo from '@/assets/logo/BaseLogo'

const ConnectWalletModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { ready } = usePrivy()

  const { sendCode, loginWithCode } = useLoginWithEmail()

  const [code, setCode] = useState('')

  const { wallets } = useWallets()

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
        {/* <WalletList /> */}

        {ready && (
          <button onClick={() => sendCode({ email: 'tomi@solidant.io' })}>
            send code
          </button>
        )}
        {ready && <input onChange={(e) => setCode(e.currentTarget.value)} />}
        {ready && (
          <button onClick={() => loginWithCode({ code })}>
            login with code
          </button>
        )}
        {wallets.length && wallets[0].address}
      </DialogContent>
    </CustomCard>
  )
}

export default ConnectWalletModal
