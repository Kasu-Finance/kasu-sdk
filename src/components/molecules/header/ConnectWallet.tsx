'use client'

import { Button, Chip, Typography, useTheme } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

import useModalState from '@/hooks/context/useModalState'

import { ArrowRightIcon, CrossIcon, WalletIcon } from '@/assets/icons'

import { networkConnection } from '@/connection/connectors/networkConnector'
import { isSupportedChain } from '@/utils'
import formatAccount from '@/utils/formats/formatAccount'

// import { StyledConnectWalletButton } from './header.style'

const ConnectWallet = () => {
  const { account, connector, chainId } = useWeb3React()

  // using state + useEffect here to deal with hydration issue
  const [text, setText] = useState('CONNECT WALLET')

  const { openModal } = useModalState()

  const handleOpen = () => openModal({ name: 'connectWalletModal' })

  const theme = useTheme()

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
      variant={account ? 'outlined' : 'contained'}
      sx={{
        pl: 2,
        pr: 2,
        ml: 'auto',
        height: 36,
        width: account ? 176 : 206,
      }}
      startIcon={
        <WalletIcon
          fill={
            account
              ? theme.palette.primary.main
              : theme.palette.primary.contrastText
          }
        />
      }
      endIcon={
        account ? <CrossIcon width='12' height='12' /> : <ArrowRightIcon />
      }
      onClick={handleOpen}
    >
      {text}
      {account && (
        <Chip
          label={
            <Typography
              textTransform='capitalize'
              variant='subtitle2'
              component='span'
              fontSize={10}
            >
              Connected
            </Typography>
          }
          variant='filled'
          sx={{
            px: '3px',
            py: 0.5,
            width: 69,
            height: 20,
            position: 'absolute',
            bottom: 0,
            transform: 'translateY(50%)',
            '& .MuiChip-label': {
              padding: 0,
            },
          }}
          size='small'
          color='success'
        />
      )}
    </Button>
  )
}

export default ConnectWallet
