'use client'

import { Box, Button, ButtonProps, Chip, Typography } from '@mui/material'
import { useLogin, usePrivy, useWallets } from '@privy-io/react-auth'
import { useSetActiveWallet } from '@privy-io/wagmi'
import { forwardRef, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

import useKycState from '@/hooks/context/useKycState'
import useLiteModeState from '@/hooks/context/useLiteModeState'
import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import getTranslation from '@/hooks/useTranslation'
import useLastActiveWallet from '@/hooks/web3/useLastActiveWallet'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { ModalsKeys } from '@/context/modal/modal.types'

import { ConnectWalletIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { formatAccount } from '@/utils'

const ConnectWalletButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { t } = getTranslation()

    const { isLiteMode } = useLiteModeState()

    const { address } = useAccount()

    const { wallets, ready: walletsReady } = useWallets()

    const { openModal } = useModalState()

    const { checkUserKyc } = useKycState()

    const { setToast, removeToast } = useToastState()

    const [connected, setConnected] = useState(false)

    const handleOpen = () => openModal({ name: ModalsKeys.LINK_WALLETS })

    const { ready } = usePrivy()

    const { isAuthenticated } = usePrivyAuthenticated()

    const { getLastActiveWallet, setLastActiveWallet } = useLastActiveWallet()

    const { setActiveWallet } = useSetActiveWallet()

    const { login } = useLogin({
      onComplete: async () => {
        setToast({
          type: 'info',
          title: 'Account connected',
          message: 'Verifying status of account...',
          isClosable: false,
        })

        setConnected(true)
      },
      onError: (error) => {
        removeToast()
        console.error(error)
      },
    })

    useEffect(() => {
      if (!connected || !wallets.length || !address || getLastActiveWallet())
        return

      const wallet = wallets.find(
        (wallet) => wallet.address.toLowerCase() === address?.toLowerCase()
      )

      if (wallet) {
        setLastActiveWallet(wallet)
      }
    }, [wallets, address, connected, getLastActiveWallet, setLastActiveWallet])

    useEffect(() => {
      const lastActiveWallet = getLastActiveWallet()

      if (!connected || !wallets.length || !address || !lastActiveWallet) return

      const abortController = new AbortController()

      setActiveWallet(lastActiveWallet)

      checkUserKyc(lastActiveWallet.address, abortController.signal)

      return () => {
        abortController.abort('new wallets detected')
      }
    }, [
      connected,
      wallets,
      walletsReady,
      address,
      getLastActiveWallet,
      checkUserKyc,
      setActiveWallet,
      setLastActiveWallet,
    ])

    if (!isAuthenticated) {
      return (
        <Button
          ref={ref}
          variant='contained'
          sx={{
            width: 184,
            textTransform: 'capitalize',
            ...customTypography.baseMd,
          }}
          startIcon={<ConnectWalletIcon key='disconnected' />}
          onClick={login}
          disabled={!ready}
          {...props}
        >
          {t('general.connectWallet')}
        </Button>
      )
    }

    return (
      <Box
        width={180}
        height={48}
        borderRadius={30}
        display='flex'
        justifyContent='center'
        alignItems='center'
        px={3}
        py={1}
        sx={{
          'svg path': {
            fill: customPalette.gold.dark,
          },
          cursor: 'pointer',
        }}
        bgcolor={isLiteMode ? 'rgba(0,0,0,0.7)' : 'gray.extraLight'}
        position='relative'
        onClick={handleOpen}
      >
        <ConnectWalletIcon key='connected' />
        <Typography variant='baseSm' color='gold.dark' mx={1.5} mt={0.5}>
          {formatAccount(address)}
        </Typography>

        <Chip
          label={
            <Typography
              textTransform='capitalize'
              variant='subtitle2'
              component='span'
              fontSize={10}
              color='white'
            >
              Connected
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
            ...(isLiteMode && { bgcolor: 'rgb(102 148 67)' }),
            '& .MuiChip-label': {
              padding: 0,
            },
          }}
          size='small'
          color='success'
        />
      </Box>
    )
  }
)

export default ConnectWalletButton
