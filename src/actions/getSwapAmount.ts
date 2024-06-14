'use server'

import { BigNumberish, ethers } from 'ethers'

import { ONE_INCH_API } from '@/config/api.oneInch'

type GetSwapAmountParams = {
  chainId: number
  fromToken: `0x${string}`
  fromAmount: string
  toToken: `0x${string}`
}

const getSwapAmount = async (
  params: GetSwapAmountParams
): Promise<BigNumberish> => {
  try {
    const { chainId, fromToken, fromAmount, toToken } = params

    const res = await fetch(
      `${ONE_INCH_API}/swap/v6.0/${chainId}/quote?${new URLSearchParams({
        src: fromToken,
        amount: fromAmount,
        dst: toToken,
      })}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_BASE_URI}`,
        },
      }
    )

    const data: { dstAmount: string } = await res.json()

    return data.dstAmount
  } catch (error) {
    return ethers.constants.Zero
  }
}

export default getSwapAmount
