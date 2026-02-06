import { useSendTransaction, useWallets } from '@privy-io/react-auth'
import { BigNumber, ethers } from 'ethers'
import { parseEther, parseUnits } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from 'wagmi/actions'

import { useChain } from '@/hooks/context/useChain'
import useToastState from '@/hooks/context/useToastState'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'
import useTokenDetails from '@/hooks/web3/useTokenDetails'

import { wagmiConfig } from '@/context/privy.provider'

import { SupportedChainIds } from '@/connection/chains'
import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { IERC20__factory } from '@/contracts/output'
import { capitalize, userRejectedTransaction } from '@/utils'
import { wrapQueuedProvider } from '@/utils/rpc/rpcQueue'
import isPrivyEmbeddedWallet from '@/utils/web3/isPrivyEmbeddedWallet'

const useApproveToken = (
  tokenAddress: `0x${string}` | undefined,
  spender: `0x${string}` | undefined,
  amount: string
) => {
  const { address } = usePrivyAuthenticated()
  const { currentChainId } = useChain()

  const { decimals } = useTokenDetails(tokenAddress)

  const { wallets } = useWallets()

  const { sendTransaction } = useSendTransaction()

  const activeWallet = wallets.find(
    (wallet) => wallet.address.toLowerCase() === address?.toLowerCase()
  )

  const shouldSponsor = isPrivyEmbeddedWallet(activeWallet)

  const [isApproved, setIsApproved] = useState(false)

  const { setToast, removeToast } = useToastState()

  const { data: allowance, mutate } = useSWR(
    address && tokenAddress && spender && currentChainId
      ? [
          `allowance-${tokenAddress}-${spender}-${address}`,
          currentChainId,
          tokenAddress,
          address,
          spender,
        ]
      : null,
    async ([_, chainId, token, userAddress, spenderAddress]) => {
      const allowance = await readContract(wagmiConfig, {
        address: token,
        abi: IERC20__factory.abi,
        functionName: 'allowance',
        args: [userAddress, spenderAddress],
        chainId: chainId as SupportedChainIds,
      })
      return BigNumber.from(allowance)
    },
    {
      fallbackData: parseEther('0'),
    }
  )

  useEffect(() => {
    if (!allowance || allowance.isZero()) {
      setIsApproved(false)
      return
    }

    if (allowance.gte(parseUnits(amount || '0', decimals))) {
      setIsApproved(true)
      return
    }

    setIsApproved(false)
  }, [allowance, amount, decimals])

  const approve = async (
    approveAmount: string,
    options?: {
      suppressToast?: boolean
      onError?: (status: 'cancelled' | 'error', error?: unknown) => void
      onStatus?: (status: 'signing' | 'confirming') => void
    }
  ): Promise<boolean> => {
    const shouldToast = !options?.suppressToast

    try {
      if (!tokenAddress)
        throw new Error('useApproveToken: tokenAddress not specified')
      if (!spender) throw new Error('useApproveToken: spender not specified')

      if (shouldToast) {
        setToast({
          type: 'info',
          title: capitalize(ActionStatus.PROCESSING),
          message: ACTION_MESSAGES[ActionType.APPROVE][ActionStatus.PROCESSING],
          isClosable: false,
        })
      }

      options?.onStatus?.('signing')

      let hash: `0x${string}`

      if (shouldSponsor && activeWallet) {
        const privyProvider = wrapQueuedProvider(
          await activeWallet.getEthereumProvider(),
          {
            sponsorTransactions: true,
            sendTransaction,
            sendTransactionAddress: activeWallet.address,
          }
        )
        if (!privyProvider) {
          throw new Error('useApproveToken: wallet provider not available')
        }

        const provider = new ethers.providers.Web3Provider(privyProvider)
        const signer = provider.getSigner(activeWallet.address)
        const tokenContract = IERC20__factory.connect(tokenAddress, signer)
        const tx = await tokenContract.approve(
          spender,
          parseUnits(approveAmount, decimals)
        )
        hash = tx.hash as `0x${string}`
      } else {
        hash = await writeContract(wagmiConfig, {
          abi: IERC20__factory.abi,
          address: tokenAddress,
          functionName: 'approve',
          args: [spender, parseUnits(approveAmount, decimals).toBigInt()],
          chainId: currentChainId as SupportedChainIds,
        })
      }

      options?.onStatus?.('confirming')

      // Use ethers.js provider as fallback for chains where wagmi polling may not work well
      const waitForReceipt = async () => {
        // Try wagmi first with short timeout
        try {
          return await waitForTransactionReceipt(wagmiConfig, {
            hash,
            chainId: currentChainId as SupportedChainIds,
            confirmations: 1,
            pollingInterval: 2_000,
            timeout: 30_000,
          })
        } catch (wagmiError) {
          // Fallback to ethers.js for chains like XDC where wagmi polling may timeout
          if (activeWallet) {
            const privyProvider = wrapQueuedProvider(
              await activeWallet.getEthereumProvider(),
              { sponsorTransactions: false }
            )
            if (privyProvider) {
              const provider = new ethers.providers.Web3Provider(privyProvider)
              const receipt = await provider.waitForTransaction(hash, 1, 60_000)
              return {
                status: receipt.status === 1 ? 'success' : 'reverted',
                blockNumber: receipt.blockNumber,
              }
            }
          }
          throw wagmiError
        }
      }

      await waitForReceipt()
      await mutate()

      if (shouldToast) {
        removeToast()
      }
      setIsApproved(true)
      return true
    } catch (error) {
      const status = userRejectedTransaction(error) ? 'cancelled' : 'error'
      options?.onError?.(status, error)

      if (!shouldToast) {
        console.error(error)
        return false
      }

      let title: string, message: string

      if (status === 'cancelled') {
        message = ACTION_MESSAGES[ActionStatus.REJECTED]
        title = capitalize(`${ActionType.APPROVE} ${ActionStatus.REJECTED}`)
      } else {
        message = ACTION_MESSAGES[ActionType.APPROVE][ActionStatus.ERROR]
        title = capitalize(`${ActionType.APPROVE} ${ActionStatus.ERROR}`)
      }

      setToast({
        type: 'error',
        title,
        message,
      })
      return false
    }
  }

  return { isApproved, approve, mutate }
}

export default useApproveToken
