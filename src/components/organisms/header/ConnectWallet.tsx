'use client'

import { Button } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

import { ArrowRightIcon, WalletIcon } from '@/assets/icons'

import { networkConnection } from '@/connection/connectors/networkConnector'
import useModalState from '@/context/modal/useModalState'
import { isSupportedChain } from '@/utils'
import formatAccount from '@/utils/formats/formatAccount'

// import { StyledConnectWalletButton } from './header.style'

const ConnectWallet = () => {
  const { account, connector, chainId } = useWeb3React()

  // using state + useEffect here to deal with hydration issue
  const [text, setText] = useState('CONNECT WALLET')

  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: 'connectWalletModal' })

  useEffect(() => {
    setText(formatAccount(account) || 'CONNECT WALLET')
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
    <Button
      variant='contained'
      sx={{ pl: 2, pr: 2, ml: 'auto', height: 36, width: 206 }}
      startIcon={<WalletIcon />}
      endIcon={<ArrowRightIcon />}
      onClick={handleOpen}
    >
      {text}
    </Button>
  )
}

export default ConnectWallet
