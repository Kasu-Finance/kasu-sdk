import { useCallback, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'

import useToastState from '@/hooks/context/useToastState'
import useSwitchChain from '@/hooks/web3/useSwitchChain'

import { NETWORK } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { isSupportedChain } from '@/utils'

const useChainStatus = () => {
  const account = useAccount()

  const chainId = useChainId()

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
  // useEffect(() => {
  //   if (
  //     chainId &&
  //     isSupportedChain(chainId) &&
  //     connector !== networkConnection.connector
  //   ) {
  //     networkConnection.connector.activate(chainId)
  //   }
  // }, [connector, chainId])

  // wrong chain listener
  useEffect(() => {
    if (
      account.address &&
      invalidChain &&
      toast?.title !== 'Wrong Chain' &&
      toast?.title !== 'Connecting Wallet' &&
      toast?.type !== 'error'
    ) {
      setToast({
        title: 'Wrong Chain',
        message:
          'An error has occured in the connection request - please switch your chain to Base and retry, or review log for more details.',
        action: {
          label: 'Switch Chain',
          onClick: async () => handleSwitchChain(),
        },
        type: 'warning',
        isClosable: false,
      })
    }
  }, [toast, account.address, invalidChain, setToast, handleSwitchChain])

  return { connected: account.address, isValidChain: !invalidChain }
}

export default useChainStatus
