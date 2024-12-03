import { NextRequest, NextResponse } from 'next/server'

import { COINMARKETCAP_API } from '@/config/api.cmc'
import { SupportedTokens } from '@/constants/tokens'

import { ValueOf } from '@/types/utils'

type Quote = {
  price: number
}

type CoinMarketCapRes = {
  data?: Record<
    ValueOf<typeof CMC_TOKEN_ID_MAP>,
    {
      quote: Record<ValueOf<typeof CMC_TOKEN_ID_MAP>, Quote>
    }
  >
  status: {
    timestamp: string
    error_code: number
    error_message: string
    elapsed: number
    credit_count: number
  }
}

const CMC_TOKEN_ID_MAP = {
  [SupportedTokens.USDC]: '3408',
  [SupportedTokens.ETH]: '1027',
  [SupportedTokens.WETH]: '1027',
  [SupportedTokens.AERO]: '29270',
  [SupportedTokens.BRETT]: '29743',
  [SupportedTokens.BENJI]: '30193',
  [SupportedTokens.DEGEN]: '30096',
  [SupportedTokens.USDBC]: '27763',
  [SupportedTokens.WSTETH]: '12409',
  [SupportedTokens.CBETH]: '21535',
} as const satisfies Record<SupportedTokens, string>

const FALLBACK_PRICES: Record<SupportedTokens, string> = {
  AERO: '0',
  BENJI: '0',
  BRETT: '0',
  cbETH: '0',
  DEGEN: '0',
  ETH: '0',
  USDbC: '0',
  USDC: '0',
  WETH: '0',
  WSTETH: '0',
}

const USDC_TOKEN_ID = CMC_TOKEN_ID_MAP[SupportedTokens.USDC]

export async function GET(req: NextRequest) {
  try {
    const tokens = req.nextUrl.searchParams.get('tokens')

    if (!tokens) {
      return new NextResponse(
        JSON.stringify({
          message: 'Parameter "tokens" is missing from the request',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const splitTokens = tokens.split(',') as SupportedTokens[]

    // Validate the provided tokens
    const invalidTokens = splitTokens.filter(
      (token) => !Object.keys(CMC_TOKEN_ID_MAP).includes(token)
    )

    if (invalidTokens.length > 0) {
      return new NextResponse(
        JSON.stringify({
          message: `Invalid tokens provided: ${invalidTokens.join(', ')}`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let tokenIds: string

    if (splitTokens.length > 1) {
      tokenIds = splitTokens.map((token) => CMC_TOKEN_ID_MAP[token]).join(',')
    } else {
      tokenIds = CMC_TOKEN_ID_MAP[splitTokens[0]]
    }

    // Fetch the data from CoinMarketCap
    const res = await fetch(
      `${COINMARKETCAP_API}?${new URLSearchParams({
        id: tokenIds,
        aux: 'is_active',
        convert_id: USDC_TOKEN_ID,
      })}`,

      {
        next: {
          revalidate: 60,
        },
        headers: {
          'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY?.toString() || '',
        },
      }
    )

    // Check if the response is OK
    if (!res.ok) {
      throw new Error(
        `Failed to fetch data from CoinMarketCap API with status ${res.status}`
      )
    }

    const response: CoinMarketCapRes = await res.json()

    if (!response.data) {
      return new NextResponse(response.status.error_message, { status: 400 })
    }

    const { data } = response

    const prices = { ...FALLBACK_PRICES }

    for (const token of splitTokens) {
      const tokenId = CMC_TOKEN_ID_MAP[token]

      const quoteData = data[tokenId]?.quote[USDC_TOKEN_ID]

      if (quoteData) {
        prices[token] = quoteData.price.toString()
      }
    }

    return new NextResponse(JSON.stringify(prices), { status: 200 })
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        message: 'An error occurred while fetching data',
        error: (error as Error).message,
        prices: FALLBACK_PRICES,
      }),
      { status: 500 }
    )
  }
}
