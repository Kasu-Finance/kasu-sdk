import { useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { parseEther, parseUnits } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { useAccount } from 'wagmi'
import { writeContract } from 'wagmi/actions'

import useToastState from '@/hooks/context/useToastState'
import useTokenDetails from '@/hooks/web3/useTokenDetails'

import { wagmiConfig } from '@/context/privy.provider'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import { IERC20__factory } from '@/contracts/output'
import { calculateMargin, capitalize, userRejectedTransaction } from '@/utils'

const useApproveToken = (
  tokenAddress: `0x${string}` | undefined,
  spender: `0x${string}` | undefined,
  amount: string
) => {
  const account = useAccount()

  const { wallets } = useWallets()

  const wallet = wallets[0]

  const { decimals } = useTokenDetails(tokenAddress)

  const [isApproved, setIsApproved] = useState(false)

  const { setToast, removeToast } = useToastState()

  const { data: allowance, mutate } = useSWR(
    wallet && account.address && tokenAddress && spender
      ? [
          `allowance-${tokenAddress}-${spender}-${account.address}`,
          tokenAddress,
          account.address,
          spender,
          wallet,
        ]
      : null,
    async ([_, token, userAddress, spender, wallet]) => {
      const privyProvider = await wallet.getEthereumProvider()

      const provider = new ethers.providers.Web3Provider(privyProvider)

      const erc20 = IERC20__factory.connect(token, provider)

      const allowance = await erc20.allowance(userAddress, spender)

      return allowance
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

  const approve = async (approveAmount: string) => {
    try {
      if (!tokenAddress)
        throw new Error('useApproveToken: tokenAddress not specified')
      if (!spender) throw new Error('useApproveToken: spender not specified')
      if (!wallet) throw new Error('userApproveToken: wallet is undefined')

      const privyProvider = await wallet.getEthereumProvider()

      const provider = new ethers.providers.Web3Provider(privyProvider)

      setToast({
        type: 'info',
        title: capitalize(ActionStatus.PROCESSING),
        message: ACTION_MESSAGES[ActionType.APPROVE][ActionStatus.PROCESSING],
        isClosable: false,
      })

      writeContract(wagmiConfig, {
        abi: IERC20__factory.abi,
        address: tokenAddress,
        functionName: 'approve',
        args: [spender, parseUnits(approveAmount, decimals).toBigInt()],
      })

      const erc20contract = IERC20__factory.connect(
        tokenAddress,
        provider.getSigner()
      )

      let useExact = false

      // https://www.reddit.com/r/ethdev/comments/1fkqbhs/estimate_gas_using_wagmi/

      const estimatedGas = await erc20contract.estimateGas
        .approve(spender, ethers.constants.MaxUint256)
        .catch(() => {
          // general fallback for tokens who restrict approval amounts
          useExact = true

          return erc20contract.estimateGas.approve(
            spender,
            parseUnits(approveAmount, decimals)
          )
        })

      const approve = await erc20contract.approve(
        spender,
        useExact
          ? parseUnits(approveAmount, decimals)
          : ethers.constants.MaxUint256,
        {
          gasLimit: calculateMargin(estimatedGas),
        }
      )

      await approve.wait()

      await mutate()

      removeToast()
      setIsApproved(true)
    } catch (error) {
      let title: string, message: string

      if (userRejectedTransaction(error)) {
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
    }
  }

  return { isApproved, approve, mutate }
}

export default useApproveToken
