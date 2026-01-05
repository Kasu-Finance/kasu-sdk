import { Box, Button, Divider, Stack, Typography } from '@mui/material'
import {
  useFundWallet,
  usePrivy,
  useSetWalletRecovery,
} from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { ErrorBoundary } from 'next/dist/client/components/error-boundary'
import React from 'react'
import { formatUnits } from 'viem'
import { useBalance, useChainId } from 'wagmi'

import useHandleError from '@/hooks/web3/useHandleError'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'
import useSupportedTokenInfo from '@/hooks/web3/useSupportedTokenInfo'
import useUserBalance from '@/hooks/web3/useUserBalance'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import InfoRow from '@/components/atoms/InfoRow'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'

import BaseLogo from '@/assets/logo/BaseLogo'

import { SupportedTokens } from '@/constants/tokens'
import { customPalette } from '@/themes/palette'
import { formatAccount, formatAmount } from '@/utils'

const ViewWalletModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { address } = usePrivyAuthenticated()

  const chainId = useChainId()

  const { data } = useBalance({
    address,
  })

  const handleError = useHandleError()

  const supportedToken = useSupportedTokenInfo()

  const { exportWallet } = usePrivy()

  const { balance, decimals } = useUserBalance(
    supportedToken?.[SupportedTokens.USDC].address
  )

  const { fundWallet } = useFundWallet()

  const handleFundWallet = () => {
    if (!address) return

    fundWallet({
      address,
      options: {
        chain: { id: chainId },
        uiConfig: {
          receiveFundsTitle: 'Receive Funds',
        },
      },
    })
  }

  const { setWalletRecovery } = useSetWalletRecovery({
    onError: handleError,
  })

  return (
    <ErrorBoundary errorComponent={() => null}>
      <CustomCard>
        <DialogHeader
          title={
            <>
              Embedded Wallet
              <Typography variant='inherit' color='white' display='inline'>
                {' '}
                {formatAccount(address)}
              </Typography>
            </>
          }
          onClose={handleClose}
        />
        <DialogContent>
          <Stack spacing={2}>
            <Box
              display='flex'
              gap={1}
              alignItems='center'
              sx={{
                'svg path': {
                  fill: customPalette.gray.extraDark,
                },
              }}
            >
              <Typography variant='h5'>Wallet Balances</Typography>
              <BaseLogo />
            </Box>

            <Divider />
          </Stack>
          <Stack spacing={3}>
            <Box>
              <InfoRow
                title='USDC'
                showDivider
                dividerProps={{ color: 'white' }}
                metric={
                  <Typography variant='baseMdBold'>
                    {formatAmount(ethers.utils.formatUnits(balance, decimals), {
                      maxDecimals: 4,
                    })}
                  </Typography>
                }
              />
              <InfoRow
                title='ETH'
                showDivider
                dividerProps={{ color: 'white' }}
                metric={
                  <Typography variant='baseMdBold'>
                    {formatAmount(
                      data ? formatUnits(data.value, data.decimals) : 0,
                      {
                        maxDecimals: 4,
                      }
                    )}
                  </Typography>
                }
              />
            </Box>
            <Stack spacing={2}>
              <Typography variant='baseMd'>
                Add funds is on-ramp or transfer funds from another wallet.
              </Typography>
              <Button
                variant='contained'
                color='secondary'
                fullWidth
                sx={{ textTransform: 'capitalize' }}
                onClick={handleFundWallet}
              >
                Add Funds
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                fullWidth
                sx={{ textTransform: 'capitalize' }}
                onClick={setWalletRecovery}
              >
                Set a recovery password
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                fullWidth
                sx={{ textTransform: 'capitalize' }}
                onClick={exportWallet}
              >
                Export Embedded Wallet
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </CustomCard>
    </ErrorBoundary>
  )
}

export default ViewWalletModal
