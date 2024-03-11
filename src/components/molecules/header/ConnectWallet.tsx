'use client'

import { Button, Chip, Typography, useTheme } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'

import ToolTip from '@/components/atoms/ToolTip'

import { ArrowRightIcon, CrossIcon, WalletIcon } from '@/assets/icons'

import { setRecentWeb3ConnectionDisconnected } from '@/connection/connection.helper'
import { networkConnection } from '@/connection/connectors/networkConnector'
import { isSupportedChain } from '@/utils'
import formatAccount from '@/utils/formats/formatAccount'

// import { StyledConnectWalletButton } from './header.style'

const ConnectWallet = () => {
  const { account, connector, chainId } = useWeb3React()
  const theme = useTheme()
  const { setToast } = useToastState()

  const { openModal } = useModalState()

  // using state + useEffect here to deal with hydration issue
  const [text, setText] = useState('CONNECT WALLET')

  const handleOpen = () => openModal({ name: 'connectWalletModal' })

  const invalidChain = chainId && !isSupportedChain(chainId)
  const connected = account && !invalidChain

  const disconnect = useCallback(() => {
    if (connector && connector.deactivate) {
      connector.deactivate()
    }
    connector.resetState()

    setRecentWeb3ConnectionDisconnected()
  }, [connector])

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

  useEffect(() => {
    if (account && invalidChain) {
      setToast({
        title: 'Wrong Chain',
        message:
          'An error has occured in the connection request - please switch your chain and retry, or review log for more details.',
        type: 'warning',
      })
    }
  }, [account, invalidChain, setToast])

  return (
    <ToolTip
      PopperProps={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 10],
            },
          },
        ],
      }}
      componentsProps={{
        tooltip: {
          sx: {
            p: 2,
          },
        },
      }}
      title={
        connected && (
          <Button
            startIcon={<CrossIcon />}
            variant='contained'
            onClick={disconnect}
            sx={{
              '& .MuiButton-startIcon > svg > path': {
                fill: 'white',
              },
            }}
          >
            Disconnect
          </Button>
        )
      }
      placement='bottom'
    >
      <Button
        variant={connected || invalidChain ? 'outlined' : 'contained'}
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
              connected || invalidChain
                ? theme.palette.primary.main
                : theme.palette.primary.contrastText
            }
          />
        }
        endIcon={
          connected || invalidChain ? (
            <CrossIcon width='12' height='12' />
          ) : (
            <ArrowRightIcon />
          )
        }
        onClick={connected || invalidChain ? undefined : handleOpen}
      >
        {text}
        {account && chainId && (
          <Chip
            label={
              <Typography
                textTransform='capitalize'
                variant='subtitle2'
                component='span'
                fontSize={10}
              >
                {isSupportedChain(chainId) ? 'Connected' : 'Wrong Chain'}
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
            color={invalidChain ? 'warning' : 'success'}
          />
        )}
      </Button>
    </ToolTip>
  )
}

export default ConnectWallet
