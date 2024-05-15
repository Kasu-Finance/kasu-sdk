'use client'

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CloseIcon from '@mui/icons-material/Close'
import { Button, Chip, Typography, useTheme } from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect, useState } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import useSwitchChain from '@/hooks/web3/useSwitchChain'

import ToolTip from '@/components/atoms/ToolTip'

import { SupportedChainIds } from '@/connection/chains'
import { setRecentWeb3ConnectionDisconnected } from '@/connection/connection.helper'
import { networkConnection } from '@/connection/connectors/networkConnector'
import { isSupportedChain } from '@/utils'
import formatAccount from '@/utils/formats/formatAccount'

const ConnectWallet = () => {
  const { account, connector, chainId } = useWeb3React()
  const theme = useTheme()
  const { setToast, removeToast } = useToastState()
  const { openModal } = useModalState()
  const switchChain = useSwitchChain()

  // using state + useEffect here to deal with hydration issue
  const [text, setText] = useState('CONNECT WALLET')

  const handleOpen = () => openModal({ name: 'connectWalletModal' })

  const handleSwitchChain = useCallback(async () => {
    const switched = await switchChain(SupportedChainIds.BASE)

    if (switched) {
      removeToast()
    }
  }, [switchChain, removeToast])

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
        action: {
          label: 'Switch Chain',
          onClick: async () => handleSwitchChain(),
        },
        type: 'warning',
      })
    }
  }, [account, invalidChain, setToast, handleSwitchChain])

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
            startIcon={<CloseIcon />}
            variant='contained'
            onClick={disconnect}
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
        }}
        startIcon={
          <AccountBalanceWalletIcon
            fill={
              connected || invalidChain
                ? theme.palette.primary.main
                : theme.palette.primary.contrastText
            }
          />
        }
        endIcon={
          connected || invalidChain ? (
            <CloseIcon width='12' height='12' />
          ) : (
            <></>
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
                color='white'
              >
                {isSupportedChain(chainId) ? 'Connected' : 'Wrong Chain'}
              </Typography>
            }
            variant='filled'
            sx={{
              px: '3px',
              pb: 0.5,
              width: 69,
              height: 20,
              position: 'absolute',
              bottom: 0,
              transform: 'translateY(50%)',
              backgroundImage: 'url("/images/seamless-noise-20.png")',
              backgroundRepeat: 'repeat',
              backgroundPosition: '0 0',
              backgroundSize: '120px 86px',
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
