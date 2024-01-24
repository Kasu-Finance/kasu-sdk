import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { parseEther, parseUnits } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import useTokenDetails from '@/hooks/web3/useTokenDetails'

import { ACTION_MESSAGES, ActionStatus, ActionType } from '@/constants'
import useToastState from '@/context/toast/useToastState'
import { IERC20__factory } from '@/contracts/output'
import { calculateMargin, userRejectedTransaction } from '@/utils'

const useApproveToken = (
  tokenAddress: string | undefined,
  spender: string | undefined,
  amount: string
) => {
  const { provider, account } = useWeb3React()

  const { decimals } = useTokenDetails(tokenAddress)

  const [isApproved, setIsApproved] = useState(false)

  const { setToast, removeToast } = useToastState()

  const { data: allowance, mutate } = useSWR(
    provider && account && tokenAddress && spender
      ? [
          `allowance-${tokenAddress}-${spender}-${account}`,
          tokenAddress,
          account,
          spender,
          provider,
        ]
      : null,
    async ([_, token, userAddress, spender, library]) => {
      const erc20 = IERC20__factory.connect(token, library)

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
      if (!provider) throw new Error('userApproveToken: provider is undefined')

      setToast({
        type: 'info',
        title: ActionStatus.PROCESSING,
        message: ACTION_MESSAGES[ActionStatus.PROCESSING],
        isClosable: false,
      })

      const erc20contract = IERC20__factory.connect(
        tokenAddress,
        provider.getSigner()
      )

      let useExact = false

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
        title = `${ActionType.APPROVE} ${ActionStatus.REJECTED}`
      } else {
        message = ACTION_MESSAGES[ActionType.APPROVE][ActionStatus.ERROR]
        title = `${ActionType.APPROVE} ${ActionStatus.ERROR}`
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
