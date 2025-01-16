import { BigNumber } from 'ethers'

import useGenerateSwapData from '@/hooks/lending/useGenerateSwapData'
import useKasuSDK, { KasuSdkNotReadyError } from '@/hooks/useKasuSDK'

import { ONE_INCH_SLIPPAGE } from '@/config/api.oneInch'
import { SupportedChainIds } from '@/connection/chains'
import { SupportedTokens, TOKENS } from '@/constants/tokens'
import { toBigNumber } from '@/utils'

type BuildSwapDataParams = {
  supportedTokens: (typeof TOKENS)[SupportedChainIds]
  chainId: number
  fromToken: `0x${string}`
  fromAmount: string
  account: string
  trancheMax: BigNumber
  currentDepositedAmount: BigNumber
  minimumDeposit: string
  isETH: boolean
}

const useBuildSwapData = () => {
  const sdk = useKasuSDK()

  const generateSwapData = useGenerateSwapData()

  return async ({
    supportedTokens,
    chainId,
    fromToken,
    fromAmount,
    account,
    trancheMax,
    currentDepositedAmount,
    minimumDeposit,
    isETH,
  }: BuildSwapDataParams) => {
    if (!sdk) {
      throw new KasuSdkNotReadyError()
    }

    const toToken = supportedTokens[SupportedTokens.USDC].address

    const res = await generateSwapData(
      chainId,
      fromToken,
      toToken,
      fromAmount,
      account as `0x${string}`,
      (parseFloat(ONE_INCH_SLIPPAGE) * 100).toString()
    )

    if ('error' in res) {
      throw new Error(
        `RequestDeposit:: Error generating swap data. ${res.error}`
      )
    }

    const dstAmount = res.dstAmount // returned from one_inch

    const maxSwapAmount = toBigNumber(
      (parseFloat(dstAmount) * 1.05).toString(),
      6
    )

    // if the swapped amount is less than the maxmium tranche allowed, use the swap amount
    const maxAmount = maxSwapAmount.lt(trancheMax)
      ? maxSwapAmount.toString()
      : trancheMax.toString()

    const minAmountOut = currentDepositedAmount.isZero() ? minimumDeposit : '1'

    const swapData = sdk.UserLending.buildDepositSwapData(
      fromToken,
      isETH ? '0' : fromAmount, // when using ETH, we pass in ethValue during transaction instead
      res.tx.to,
      res.tx.data,
      minAmountOut
    )

    return {
      maxAmount,
      swapData,
    }
  }
}

export default useBuildSwapData
