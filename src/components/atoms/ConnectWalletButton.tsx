'use client'

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CloseIcon from '@mui/icons-material/Close'
import {
  Button,
  ButtonProps,
  Chip,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material'
import { useWeb3React } from '@web3-react/core'
import { forwardRef, useCallback, useEffect, useState } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import useTranslation from '@/hooks/useTranslation'
import useSwitchChain from '@/hooks/web3/useSwitchChain'
import useWalletActivation from '@/hooks/web3/useWalletActivation'

import { ModalsKeys } from '@/context/modal/modal.types'

import { SupportedChainIds } from '@/connection/chains'
import { networkConnection } from '@/connection/connectors/networkConnector'
import { isSupportedChain } from '@/utils'
import formatAccount from '@/utils/formats/formatAccount'

const ConnectWalletButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { t } = useTranslation()

    const { account, connector, chainId } = useWeb3React()
    const theme = useTheme()
    const { toast, setToast, removeToast } = useToastState()
    const { openModal } = useModalState()
    const switchChain = useSwitchChain()

    const { disconnect } = useWalletActivation()

    // using state + useEffect here to deal with hydration issue
    const [text, setText] = useState(t('general.connectWallet'))

    const handleOpen = () => openModal({ name: ModalsKeys.CONNECT_WALLET })

    const handleSwitchChain = useCallback(async () => {
      const switched = await switchChain(SupportedChainIds.BASE)

      if (switched) {
        removeToast()
      }
    }, [switchChain, removeToast])

    const invalidChain = chainId && !isSupportedChain(chainId)
    const connected = account && !invalidChain

    useEffect(() => {
      setText(formatAccount(account) || t('general.connectWallet'))
    }, [account, t])

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
      if (account && invalidChain && toast?.title !== 'Wrong Chain') {
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
    }, [toast, account, invalidChain, setToast, handleSwitchChain])

    return (
      <Button
        ref={ref}
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
            <IconButton
              sx={(theme) => ({
                '.MuiSvgIcon-root': {
                  width: 20,
                  height: 20,
                  fill: theme.palette.primary.main,
                },
              })}
              onClick={disconnect}
            >
              <CloseIcon />
            </IconButton>
          ) : (
            <></>
          )
        }
        onClick={connected || invalidChain ? undefined : handleOpen}
        {...props}
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
    )
  }
)

export default ConnectWalletButton
