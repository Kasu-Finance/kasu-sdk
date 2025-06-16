import { Box, Button, List, ListItem, Stack, Typography } from '@mui/material'
import {
  ConnectedWallet,
  useLogout,
  usePrivy,
  useWallets,
} from '@privy-io/react-auth'
import { useSetActiveWallet } from '@privy-io/wagmi'
import React from 'react'
import { useAccount } from 'wagmi'

import useModalState from '@/hooks/context/useModalState'
import useLastActiveWallet from '@/hooks/web3/useLastActiveWallet'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'

import { ModalsKeys } from '@/context/modal/modal.types'

import BaseLogo from '@/assets/logo/BaseLogo'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { formatAccount } from '@/utils'

const LinkWalletsModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { wallets } = useWallets()

  const account = useAccount()

  const { linkWallet } = usePrivy()

  const { setActiveWallet } = useSetActiveWallet()

  const { setLastActiveWallet } = useLastActiveWallet()

  const { openModal } = useModalState()

  const { logout } = useLogout()

  const viewWallet = () => {
    handleClose()
    openModal({ name: ModalsKeys.VIEW_WALLET })
  }

  const disconnect = async () => {
    await logout()

    handleClose()
  }

  const changeActiveWallet = async (wallet: ConnectedWallet) => {
    setLastActiveWallet(wallet)
    await setActiveWallet(wallet)
  }

  return (
    <CustomCard>
      <DialogHeader
        title={
          <>
            Connected Wallets
            <BaseLogo />
          </>
        }
        titleProps={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
        onClose={handleClose}
      />

      <DialogContent>
        <Stack spacing={2}>
          <Box>
            <List
              sx={{
                'li + li': {
                  mt: 1,
                },
              }}
            >
              {wallets.map((wallet, index) => {
                const isActiveWallet =
                  wallet.address.toLowerCase() ===
                  account.address?.toLowerCase()

                const isPrivy = wallet.walletClientType === 'privy'

                return (
                  <ListItem
                    key={index}
                    sx={{
                      border: `1px solid ${customPalette.gold.extraDark}`,
                      borderRadius: 30,
                      py: 0.5,
                      height: isPrivy ? 'auto' : 48,
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover .set-active-button': {
                        opacity: 1,
                        transform: 'translateX(0)',
                      },
                    }}
                  >
                    <Stack>
                      <Typography variant='baseXs' color='rgba(133, 87, 38, 1)'>
                        {wallet.meta.name}
                      </Typography>
                      <Typography variant='baseMd'>
                        {formatAccount(wallet.address)}
                      </Typography>
                    </Stack>
                    {isActiveWallet ? (
                      <Box>
                        {isPrivy && (
                          <Button
                            variant='contained'
                            color='secondary'
                            sx={{
                              ...customTypography.baseSm,
                              textTransform: 'capitalize',
                              mr: 1,
                              height: 26,
                            }}
                            onClick={viewWallet}
                          >
                            View Wallet
                          </Button>
                        )}
                        <Typography
                          variant='baseSm'
                          color='white'
                          px={2}
                          py={0.5}
                          bgcolor={customPalette.gold.dark}
                          borderRadius={30}
                          height={26}
                        >
                          Active
                        </Typography>
                      </Box>
                    ) : (
                      <Button
                        variant='contained'
                        color='secondary'
                        className='set-active-button'
                        sx={{
                          textTransform: 'capitalize',
                          ...customTypography.baseSm,
                          px: 2,
                          py: 0.5,
                          height: 26,
                          transition: 'opacity 0.3s ease, transform 0.3s ease',
                          opacity: 0,
                          transform: 'translateX(50%)',
                        }}
                        size='small'
                        onClick={() => changeActiveWallet(wallet)}
                      >
                        Set Active
                      </Button>
                    )}
                  </ListItem>
                )
              })}
            </List>
          </Box>
          <Box
            display='grid'
            gridTemplateColumns='minmax(0,1fr) max-content minmax(0,1fr)'
            alignItems='center'
            gap={1.5}
          >
            <Button
              variant='contained'
              color='secondary'
              fullWidth
              onClick={linkWallet}
              sx={{ textTransform: 'capitalize' }}
            >
              Link another wallet
            </Button>
            <Typography>or</Typography>
            <Button
              variant='outlined'
              color='secondary'
              fullWidth
              onClick={disconnect}
              sx={{ textTransform: 'capitalize' }}
            >
              Disconnect
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </CustomCard>
  )
}

export default LinkWalletsModal
