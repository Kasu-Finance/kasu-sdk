'use client'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {
  Box,
  Button,
  ButtonProps,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import { useLogin, usePrivy, useWallets } from '@privy-io/react-auth'
import { useSetActiveWallet } from '@privy-io/wagmi'
import { forwardRef, useEffect, useState } from 'react'
import { useSwitchChain } from 'wagmi'

import useLiteModeState from '@/hooks/context/useLiteModeState'
import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import getTranslation from '@/hooks/useTranslation'
import useLastActiveWallet from '@/hooks/web3/useLastActiveWallet'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { ModalsKeys } from '@/context/modal/modal.types'

import { BaseIcon, ConnectWalletIcon, XdcIcon } from '@/assets/icons'

import { isChainSupported, SUPPORTED_CHAINS } from '@/config/chains'
import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { formatAccount } from '@/utils'
import { wrapQueuedProvider } from '@/utils/rpc/rpcQueue'
import isPrivyEmbeddedWallet from '@/utils/web3/isPrivyEmbeddedWallet'

type ConnectWalletButtonProps = ButtonProps & {
  compact?: boolean
}

const ConnectWalletButton = forwardRef<
  HTMLButtonElement,
  ConnectWalletButtonProps
>((props, ref) => {
  const { t } = getTranslation()

  const { compact, ...buttonProps } = props

  const { isLiteMode } = useLiteModeState()

  const { wallets } = useWallets()

  const { openModal, closeModal } = useModalState()

  const { setToast, removeToast } = useToastState()

  const [connected, setConnected] = useState(false)

  const handleOpen = () => openModal({ name: ModalsKeys.LINK_WALLETS })

  const { ready } = usePrivy()

  const { address, isAuthenticated } = usePrivyAuthenticated()

  const { setLastActiveWallet } = useLastActiveWallet()

  const { setActiveWallet } = useSetActiveWallet()
  const [actualChainId, setActualChainId] = useState<number>()
  const [chainMenuAnchor, setChainMenuAnchor] = useState<null | HTMLElement>(
    null
  )
  const chainMenuOpen = Boolean(chainMenuAnchor)

  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain()

  // Get chain icon based on chain ID
  const getChainIcon = (chainId: number | undefined, size = 16) => {
    const iconStyle = { width: size, height: size }
    switch (chainId) {
      case 8453: // Base
        return (
          <Box sx={iconStyle}>
            <BaseIcon />
          </Box>
        )
      case 50: // XDC
        return (
          <Box sx={iconStyle}>
            <XdcIcon />
          </Box>
        )
      default:
        return null
    }
  }

  const handleChainMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setChainMenuAnchor(event.currentTarget)
  }

  const handleChainMenuClose = () => {
    setChainMenuAnchor(null)
  }

  const handleSwitchChain = async (chainId: number) => {
    try {
      if (!switchChainAsync) {
        setToast({
          type: 'error',
          title: 'Network switch unavailable',
          message: 'Please switch networks directly in your wallet.',
        })
        return
      }
      await switchChainAsync({ chainId })
      handleChainMenuClose()
    } catch (error) {
      console.error(error)
      setToast({
        type: 'error',
        title: 'Network switch failed',
        message: 'Please switch networks in your wallet and try again.',
      })
    }
  }

  // Check if the actual chain is one of the supported chains
  const isOnSupportedChain = actualChainId
    ? isChainSupported(actualChainId)
    : false

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
    if (isAuthenticated && address) {
      setConnected(true)
      return
    }

    setConnected(false)
  }, [address, isAuthenticated])

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

      const provider: any = wrapQueuedProvider(
        await wallet.getEthereumProvider(),
        { sponsorTransactions: isPrivyEmbeddedWallet(wallet) }
      )
      if (!provider) {
        setActualChainId(undefined)
        return
      }

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

    if (!isOnSupportedChain) {
      openModal({
        name: ModalsKeys.WRONG_NETWORK,
        detectedChainId: actualChainId,
      })
    } else {
      closeModal(ModalsKeys.WRONG_NETWORK)
    }
  }, [
    actualChainId,
    closeModal,
    isOnSupportedChain,
    isAuthenticated,
    openModal,
  ])

  useEffect(() => {
    if (!connected || !wallets.length || !address) return

    const wallet = wallets.find(
      (wallet) => wallet.address.toLowerCase() === address?.toLowerCase()
    )

    if (wallet) {
      setLastActiveWallet(wallet)
      setActiveWallet(wallet)
    }
  }, [wallets, address, connected, setLastActiveWallet, setActiveWallet])

  if (!isAuthenticated) {
    if (compact) {
      return (
        <IconButton
          ref={ref}
          aria-label={t('general.connectWallet')}
          onClick={login}
          disabled={!ready}
          className={buttonProps.className}
          id={buttonProps.id}
          title={buttonProps.title}
          tabIndex={buttonProps.tabIndex}
          sx={[
            {
              bgcolor: isLiteMode ? 'rgba(0,0,0,0.35)' : 'gray.extraLight',
              backdropFilter: isLiteMode ? 'blur(6px)' : undefined,
              '&:hover': {
                bgcolor: isLiteMode ? 'rgba(0,0,0,0.5)' : 'gray.light',
              },
            },
            ...(Array.isArray(buttonProps.sx)
              ? buttonProps.sx
              : [buttonProps.sx]),
          ]}
        >
          <ConnectWalletIcon key='disconnected' />
        </IconButton>
      )
    }

    return (
      <Button
        ref={ref}
        variant='contained'
        sx={{
          width: { xs: '100%', sm: 184 },
          textTransform: 'capitalize',
          ...customTypography.baseMd,
        }}
        startIcon={<ConnectWalletIcon key='disconnected' />}
        onClick={login}
        disabled={!ready}
        {...buttonProps}
      >
        {t('general.connectWallet')}
      </Button>
    )
  }

  if (compact) {
    return (
      <IconButton
        ref={ref}
        aria-label={t('general.connectWallet')}
        onClick={handleOpen}
        className={buttonProps.className}
        id={buttonProps.id}
        title={buttonProps.title}
        tabIndex={buttonProps.tabIndex}
        sx={[
          {
            bgcolor: isLiteMode ? 'rgba(0,0,0,0.35)' : 'gray.extraLight',
            backdropFilter: isLiteMode ? 'blur(6px)' : undefined,
            '&:hover': {
              bgcolor: isLiteMode ? 'rgba(0,0,0,0.5)' : 'gray.light',
            },
            'svg path': {
              fill: customPalette.gold.dark,
            },
          },
          ...(Array.isArray(buttonProps.sx)
            ? buttonProps.sx
            : [buttonProps.sx]),
        ]}
      >
        <ConnectWalletIcon key='connected' />
      </IconButton>
    )
  }

  return (
    <>
      <Box
        width={{ xs: '100%', sm: 220 }}
        height={48}
        borderRadius={30}
        display='flex'
        justifyContent='center'
        alignItems='center'
        px={2}
        py={1}
        sx={{
          cursor: 'pointer',
        }}
        bgcolor={isLiteMode ? 'rgba(0,0,0,0.7)' : 'gray.extraLight'}
        position='relative'
      >
        {/* Wallet section - opens wallet modal */}
        <Box
          display='flex'
          alignItems='center'
          onClick={handleOpen}
          sx={{
            cursor: 'pointer',
            'svg path': {
              fill: customPalette.gold.dark,
            },
          }}
        >
          <ConnectWalletIcon key='connected' />
          <Typography variant='baseSm' color='gold.dark' mx={1.5} mt={0.5}>
            {formatAccount(address)}
          </Typography>
        </Box>

        {/* Chain selector section */}
        <Box
          display='flex'
          alignItems='center'
          onClick={handleChainMenuOpen}
          sx={{
            cursor: isSwitchingChain ? 'wait' : 'pointer',
            opacity: isSwitchingChain ? 0.6 : 1,
            '&:hover': {
              opacity: 0.8,
            },
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: 'white',
              overflow: 'hidden',
              '& svg': {
                width: 24,
                height: 24,
              },
            }}
          >
            {getChainIcon(actualChainId, 24)}
          </Box>
          <KeyboardArrowDownIcon
            sx={{
              color: customPalette.gold.dark,
              fontSize: 18,
              ml: 0.25,
              transform: chainMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </Box>

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

      {/* Chain selection menu */}
      <Menu
        anchorEl={chainMenuAnchor}
        open={chainMenuOpen}
        onClose={handleChainMenuClose}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: isLiteMode ? 'gray.extraDark' : 'white',
              borderRadius: 2,
              mt: 1,
              minWidth: 160,
              boxShadow: isLiteMode ? 'none' : 3,
            },
          },
        }}
      >
        {Object.values(SUPPORTED_CHAINS).map((chain) => (
          <MenuItem
            key={chain.chainId}
            onClick={() => handleSwitchChain(chain.chainId)}
            selected={actualChainId === chain.chainId}
            disabled={isSwitchingChain}
            sx={{
              color: isLiteMode ? customPalette.gold.dark : 'gray.extraDark',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 1.5,
              '&:hover': {
                bgcolor: isLiteMode
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.04)',
              },
              '&.Mui-selected': {
                bgcolor: isLiteMode
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.08)',
                '&:hover': {
                  bgcolor: isLiteMode
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.12)',
                },
              },
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getChainIcon(chain.chainId, 24)}
            </Box>
            <Typography
              variant='baseSm'
              color={isLiteMode ? 'gold.dark' : 'gray.extraDark'}
            >
              {chain.name}
            </Typography>
            {actualChainId === chain.chainId && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  ml: 'auto',
                }}
              />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
})

export default ConnectWalletButton
