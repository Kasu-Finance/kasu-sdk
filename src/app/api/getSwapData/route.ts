import { NextRequest } from 'next/server'

import { ONE_INCH_API } from '@/config/api.oneInch'
import { SWAPPER } from '@/config/sdk'

export type SwapDataRes =
  | {
      dstAmount: string
      tx: {
        from: string
        to: string
        data: string
        value: string
        gas: number
        gasPrice: string
      }
    }
  | {
      error: string
      description: string
    }

export async function GET(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams

  const chainId = queryParams.get('chainId')
  const src = queryParams.get('fromToken')
  const dst = queryParams.get('toToken')
  const amount = queryParams.get('fromAmount')
  const from = queryParams.get('user')
  const slippage = queryParams.get('slippage')

  if (!chainId || !src || !dst || !amount || !from || !slippage) {
    return Response.json({ message: 'Missing parameters' }, { status: 400 })
  }

  const url = `${ONE_INCH_API}/swap/v6.0/${chainId}/swap?${new URLSearchParams({
    src,
    dst,
    amount,
    from: SWAPPER,
    slippage,
    disableEstimate: 'true',
    allowPartialFill: 'false',
  })}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
    },
  })

  const data: SwapDataRes = await res.json()

  if ('error' in data) {
    return Response.json(data, { status: 400 })
  }

  return Response.json(data)
}
