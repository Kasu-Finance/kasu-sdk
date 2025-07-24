'use server'

import { BigNumber, BigNumberish } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

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
      `${ONE_INCH_API}/swap/v6.1/${chainId}/quote?${new URLSearchParams({
        src: fromToken,
        amount: fromAmount,
        dst: toToken,
      })}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
        },
      }
    )

    if (!res.ok) {
      throw new Error(res.statusText)
    }

    const data: { dstAmount: string } = await res.json()

    return data.dstAmount
  } catch (error) {
    console.error(error)
    return BigNumber.from(params.fromAmount)
      .mul('3645')
      .div(parseUnits('1', 12))
      .toString()
    // return '0'
  }
}

export default getSwapAmount
