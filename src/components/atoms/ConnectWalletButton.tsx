'use client'

import { Box, Button, ButtonProps, Chip, Typography } from '@mui/material'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import { forwardRef } from 'react'
import { useAccount } from 'wagmi'

import useKycState from '@/hooks/context/useKycState'
import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'
import getTranslation from '@/hooks/useTranslation'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import { ModalsKeys } from '@/context/modal/modal.types'

import { ConnectWalletIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { formatAccount } from '@/utils'

const ConnectWalletButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { t } = getTranslation()

    const account = useAccount()

    const { openModal } = useModalState()

    const { checkUserKyc } = useKycState()

    const { setToast, removeToast } = useToastState()

    const handleOpen = () => openModal({ name: ModalsKeys.LINK_WALLETS })

    const { login } = useLogin({
      onComplete: async ({ user }) => {
        setToast({
          type: 'info',
          title: 'Account connected',
          message: 'Verifying status of account...',
          isClosable: false,
        })

        if (user.wallet?.address) {
          await checkUserKyc(user.wallet.address)
        }
      },
      onError: (error) => {
        removeToast()
        console.error(error)
      },
    })

    const { ready } = usePrivy()

    const { isAuthenticated } = usePrivyAuthenticated()

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
        bgcolor='gray.extraLight'
        position='relative'
        onClick={handleOpen}
      >
        <ConnectWalletIcon key='connected' />
        <Typography variant='baseSm' color='gold.dark' mx={1.5} mt={0.5}>
          {formatAccount(account.address)}
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
            backgroundImage: 'url("/images/seamless-noise-20.png")',
            backgroundRepeat: 'repeat',
            backgroundPosition: '0 0',
            backgroundSize: '120px 86px',
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
