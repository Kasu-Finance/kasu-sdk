'use client'

import Typography from '@mui/material/Typography'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

import ConnectWalletModal from '@/components/molecules/ConnectWalletModal'

import { WalletIcon } from '@/assets/icons'

import { networkConnection } from '@/connection/connectors/networkConnector'
import { isSupportedChain } from '@/utils'
import formatAccount from '@/utils/formats/formatAccount'

import { StyledConnectWalletButton } from './header.style'

const ConnectWallet = () => {
  const { account, connector, chainId } = useWeb3React()

  // using state + useEffect here to deal with hydration issue
  const [text, setText] = useState('Connect Wallet')

  useEffect(() => {
    setText(formatAccount(account) || 'Connect Wallet')
  }, [account])

  useEffect(() => {
    if (
      chainId &&
      isSupportedChain(chainId) &&
      connector !== networkConnection.connector
    ) {
      networkConnection.connector.activate(chainId)
    }
  }, [connector, chainId])

  return (
    <ConnectWalletModal
      trigger={
        <StyledConnectWalletButton>
          <WalletIcon />
          <Typography variant='body2'>{text}</Typography>
        </StyledConnectWalletButton>
      }
    />
  )
}

export default ConnectWallet
