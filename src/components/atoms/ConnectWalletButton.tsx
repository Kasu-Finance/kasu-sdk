'use client'

import { Box, Button, ButtonProps, Chip, Typography } from '@mui/material'
import { useLogin, usePrivy, useWallets } from '@privy-io/react-auth'
import { useSetActiveWallet } from '@privy-io/wagmi'
import { forwardRef, useEffect, useState } from 'react'

import useKycState from '@/hooks/context/useKycState'
import useLiteModeState from '@/hooks/context/useLiteModeState'
import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import getTranslation from '@/hooks/useTranslation'
import useLastActiveWallet from '@/hooks/web3/useLastActiveWallet'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { ModalsKeys } from '@/context/modal/modal.types'

import { ConnectWalletIcon } from '@/assets/icons'

import { NETWORK } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { formatAccount } from '@/utils'

const ConnectWalletButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { t } = getTranslation()

    const { isLiteMode } = useLiteModeState()

    const { wallets, ready: walletsReady } = useWallets()

    const { openModal, closeModal } = useModalState()

    const { checkUserKyc } = useKycState()

    const { setToast, removeToast } = useToastState()

    const [connected, setConnected] = useState(false)

    const handleOpen = () => openModal({ name: ModalsKeys.LINK_WALLETS })

    const { ready } = usePrivy()

    const { address, isAuthenticated } = usePrivyAuthenticated()

    const { getLastActiveWallet, setLastActiveWallet } = useLastActiveWallet()

    const { setActiveWallet } = useSetActiveWallet()
    const [actualChainId, setActualChainId] = useState<number>()

    const expectedChainId =
      NETWORK === 'BASE'
        ? SupportedChainIds.BASE
        : SupportedChainIds.BASE_SEPOLIA

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
      let isMounted = true
      let cleanup: (() => void) | undefined

      const updateChainId = (chain: unknown) => {
        const numericChain =
          typeof chain === 'string'
            ? Number.parseInt(chain, 16)
            : typeof chain === 'number'
              ? chain
              : undefined

        if (Number.isFinite(numericChain) && isMounted) {
          setActualChainId(numericChain)
        }
      }

      const resolveChain = async () => {
        if (!wallets.length || !address) {
          setActualChainId(undefined)
          return
        }

        const wallet = wallets.find(
          (w) => w.address.toLowerCase() === address.toLowerCase()
        )

        if (!wallet) {
          setActualChainId(undefined)
          return
        }

        const provider: any = await wallet.getEthereumProvider()

        const chain = provider?.chainId
          ? provider.chainId
          : await provider?.request?.({ method: 'eth_chainId' })

        updateChainId(chain)

        const handler = (id: unknown) => updateChainId(id)

        if (provider?.on) {
          provider.on('chainChanged', handler)
          cleanup = () => {
            provider.removeListener?.('chainChanged', handler) ||
              provider.off?.('chainChanged', handler)
          }
        }
      }

      resolveChain()

      return () => {
        isMounted = false
        cleanup?.()
      }
    }, [address, wallets])

    useEffect(() => {
      if (!isAuthenticated) {
        closeModal(ModalsKeys.WRONG_NETWORK)
        return
      }

      if (!actualChainId) return

      if (actualChainId !== expectedChainId) {
        openModal({
          name: ModalsKeys.WRONG_NETWORK,
          detectedChainId: actualChainId,
        })
      } else {
        closeModal(ModalsKeys.WRONG_NETWORK)
      }
    }, [actualChainId, closeModal, expectedChainId, isAuthenticated, openModal])

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
