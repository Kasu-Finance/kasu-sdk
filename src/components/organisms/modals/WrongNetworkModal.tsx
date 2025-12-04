'use client'

import { Box, Link, Stack, Typography } from '@mui/material'
import { useSwitchChain } from 'wagmi'

import useModalState from '@/hooks/context/useModalState'
import useToastState from '@/hooks/context/useToastState'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DialogHeader from '@/components/molecules/DialogHeader'

import { NETWORK } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { networks } from '@/connection/networks'
import { customPalette } from '@/themes/palette'

const WrongNetworkModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { modal } = useModalState()
  const { wrongNetworkModal } = modal
  const detectedChainId = wrongNetworkModal.detectedChainId

  const { setToast } = useToastState()

  const expectedChainId =
    NETWORK === 'BASE' ? SupportedChainIds.BASE : SupportedChainIds.BASE_SEPOLIA

  const expectedNetwork = networks[expectedChainId]

  const currentNetwork =
    (detectedChainId && networks[detectedChainId as SupportedChainIds]) ||
    undefined

  const { switchChainAsync, isPending } = useSwitchChain()

  const handleSwitch = async () => {
    try {
      if (!switchChainAsync) {
        setToast({
          type: 'error',
          title: 'Network switch unavailable',
          message: 'Please switch networks directly in your wallet.',
        })
        return
      }

      await switchChainAsync({ chainId: expectedChainId })
    } catch (error) {
      console.error(error)
      setToast({
        type: 'error',
        title: 'Network switch failed',
        message: 'Please switch networks in your wallet and try again.',
      })
    }
  }

  return (
    <CustomCard>
      <DialogHeader
        title='Wrong network'
        onClose={handleClose}
        showClose={false}
      />
      <Box px={4} py={4}>
        <Stack spacing={2.5} alignItems='center' textAlign='center'>
          <Link
            component='button'
            variant='h5'
            color={customPalette.gold.dark}
            underline='always'
            onClick={handleSwitch}
            aria-disabled={isPending}
            sx={{
              fontWeight: 600,
              cursor: isPending ? 'not-allowed' : 'pointer',
              pointerEvents: isPending ? 'none' : 'auto',
            }}
          >
            Switch to {expectedNetwork.chainName}
          </Link>
          <Typography variant='baseMd' color='white'>
            Kasu is live on {expectedNetwork.chainName}. Please change your
            wallet network to continue. This dialog will close automatically
            once you are on the correct chain.
          </Typography>
          <Typography variant='baseSm' color='gray.light'>
            Detected network:{' '}
            {currentNetwork
              ? `${currentNetwork.chainName} (chainId: ${detectedChainId})`
              : detectedChainId
                ? `Unknown (chainId: ${detectedChainId})`
                : 'Waiting for wallet'}
          </Typography>
        </Stack>
      </Box>
    </CustomCard>
  )
}

export default WrongNetworkModal
