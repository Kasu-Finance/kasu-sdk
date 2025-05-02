'use client'

import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  ButtonProps,
  Chip,
  IconButton,
  Typography,
} from '@mui/material'
import { useLogin, useLogout, usePrivy, useWallets } from '@privy-io/react-auth'
import { forwardRef, useEffect } from 'react'
import { useAccount } from 'wagmi'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'
import useChainStatus from '@/hooks/web3/useChainStatus'
import useWalletActivation from '@/hooks/web3/useWalletActivation'

import { ConnectWalletIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { formatAccount } from '@/utils'

const ConnectWalletButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { t } = getTranslation()

    const account = useAccount()

    const { openModal } = useModalState()

    const { disconnect } = useWalletActivation()

    const { login } = useLogin({})

    useEffect(() => {}, [])

    const handleOpen = () => login()

    const { connected, isValidChain } = useChainStatus()

    const { wallets } = useWallets()

    const { ready, authenticated } = usePrivy()
    const { logout } = useLogout()

    console.log(account.connector)

    if (ready && authenticated) {
      return <Button onClick={logout}>logout</Button>
    }

    if (!connected || !authenticated) {
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
          onClick={handleOpen}
          {...props}
        >
          {wallets.length
            ? formatAccount(wallets[0].address)
            : t('general.connectWallet')}
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
        }}
        bgcolor='gray.extraLight'
        position='relative'
      >
        <ConnectWalletIcon key='connected' />
        <Typography variant='baseSm' color='gold.dark' mx={1.5} mt={0.5}>
          {formatAccount(account.address)}
        </Typography>
        <IconButton sx={{ p: 0 }} onClick={logout}>
          <CloseIcon sx={{ width: 16, height: 16 }} />
        </IconButton>
        <Chip
          label={
            <Typography
              textTransform='capitalize'
              variant='subtitle2'
              component='span'
              fontSize={10}
              color='white'
            >
              {isValidChain ? 'Connected' : 'Wrong Chain'}
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
          color={isValidChain ? 'success' : 'warning'}
        />
      </Box>
    )
  }
)

export default ConnectWalletButton
