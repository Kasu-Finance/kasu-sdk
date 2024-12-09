import { useWeb3React } from '@web3-react/core'
import { useCallback, useEffect } from 'react'

import useToastState from '@/hooks/context/useToastState'
import useSwitchChain from '@/hooks/web3/useSwitchChain'

import { NETWORK } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { networkConnection } from '@/connection/connectors/networkConnector'
import { isSupportedChain } from '@/utils'

const useChainStatus = () => {
  const { account, connector, chainId } = useWeb3React()

  const { toast, setToast, removeToast } = useToastState()

  const switchChain = useSwitchChain()

  const invalidChain = chainId && !isSupportedChain(chainId)

  const handleSwitchChain = useCallback(async () => {
    const switched = await switchChain(
      NETWORK === 'BASE'
        ? SupportedChainIds.BASE
        : SupportedChainIds.BASE_SEPOLIA
    )

    if (switched) {
      removeToast()
    }
  }, [switchChain, removeToast])

  // auto activate back to networkConnector
  useEffect(() => {
    if (
      chainId &&
      isSupportedChain(chainId) &&
      connector !== networkConnection.connector
    ) {
      networkConnection.connector.activate(chainId)
    }
  }, [connector, chainId])

  // wrong chain listener
  useEffect(() => {
    if (
      account &&
      invalidChain &&
      toast?.title !== 'Wrong Chain' &&
      toast?.title !== 'Connecting Wallet' &&
      toast?.type !== 'error'
    ) {
      setToast({
        title: 'Wrong Chain',
        message:
          'An error has occured in the connection request - please switch your chain and retry, or review log for more details.',
        action: {
          label: 'Switch Chain',
          onClick: async () => handleSwitchChain(),
        },
        type: 'warning',
        isClosable: false,
      })
    }
  }, [toast, account, invalidChain, setToast, handleSwitchChain])

  return { connected: account, isValidChain: !invalidChain }
}

export default useChainStatus
