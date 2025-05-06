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

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'

import BaseLogo from '@/assets/logo/BaseLogo'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { formatAccount } from '@/utils'

const LinkWalletsModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { wallets } = useWallets()

  const account = useAccount()

  const { linkWallet } = usePrivy()

  const { setActiveWallet } = useSetActiveWallet()

  const { logout } = useLogout()

  const disconnect = async () => {
    await logout()

    handleClose()
  }

  const changeActiveWallet = async (wallet: ConnectedWallet) => {
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

                return (
                  <ListItem
                    key={index}
                    sx={{
                      border: `1px solid ${customPalette.gold.extraDark}`,
                      borderRadius: 30,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.5,
                      height: 48,
                      overflow: 'hidden',
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
                      <Typography
                        variant='baseSm'
                        color={customPalette.gold.dark}
                        px={2}
                        py={0.5}
                        bgcolor={customPalette.gray.extraDark}
                        borderRadius={30}
                        height={26}
                      >
                        Active
                      </Typography>
                    ) : (
                      <Button
                        variant='contained'
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
            <Button
              variant='contained'
              color='secondary'
              fullWidth
              onClick={linkWallet}
              sx={{ textTransform: 'capitalize' }}
            >
              Link another wallet
            </Button>
          </Box>
          <Typography
            sx={{
              display: 'grid',
              textAlign: 'center',
              alignItems: 'center',
              width: '100%',
              gridTemplateColumns: 'minmax(20px, 1fr) auto minmax(20px,  1fr)',
              gap: 2,
              '&::before, &::after': {
                content: '""',
                borderTop: `1px solid ${customPalette.gold.extraDark}`,
              },
            }}
          >
            or
          </Typography>
          <Button
            variant='outlined'
            color='secondary'
            fullWidth
            onClick={disconnect}
            sx={{ textTransform: 'capitalize' }}
          >
            Disconnect
          </Button>
        </Stack>
      </DialogContent>
    </CustomCard>
  )
}

export default LinkWalletsModal
