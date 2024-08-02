'use client'

import CloseIcon from '@mui/icons-material/Close'
import { Button } from '@mui/material'
import { useWeb3React } from '@web3-react/core'

import useDeviceDetection, { Device } from '@/hooks/useDeviceDetections'
import useWalletActivation from '@/hooks/web3/useWalletActivation'

import ConnectWalletButton from '@/components/atoms/ConnectWalletButton'
import ToolTip from '@/components/atoms/ToolTip'

import { isSupportedChain } from '@/utils'

const ConnectWallet = () => {
  const currentDevice = useDeviceDetection()

  const { account, chainId } = useWeb3React()

  const { disconnect } = useWalletActivation()

  const invalidChain = chainId && !isSupportedChain(chainId)
  const connected = account && !invalidChain

  if (currentDevice === Device.MOBILE) {
    return null
  }

  return (
    <ToolTip
      PopperProps={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 10],
            },
          },
        ],
      }}
      componentsProps={{
        tooltip: {
          sx: {
            p: 2,
          },
        },
      }}
      title={
        connected && (
          <Button
            startIcon={<CloseIcon />}
            variant='contained'
            onClick={disconnect}
          >
            Disconnect
          </Button>
        )
      }
      placement='bottom'
    >
      <ConnectWalletButton />
    </ToolTip>
  )
}

export default ConnectWallet
