import { NextRequest, NextResponse } from 'next/server'

import { COINMARKETCAP_API } from '@/config/api.cmc'
import { SupportedTokens } from '@/constants/tokens'

import { ValueOf } from '@/types/utils'

type Quote = {
  price: number
}

type CoinMarketCapRes = {
  data: Record<
    ValueOf<typeof CMC_TOKEN_ID_MAP>,
    {
      quote: Record<ValueOf<typeof CMC_TOKEN_ID_MAP>, Quote>
    }
  >
}

const CMC_TOKEN_ID_MAP = {
  // [SupportedTokens.DAI]: '4943',
  [SupportedTokens.USDC]: '3408',
  [SupportedTokens.ETH]: '1027',
  [SupportedTokens.WETH]: '1027',
} as const satisfies Record<SupportedTokens, string>

const USDC_TOKEN_ID = CMC_TOKEN_ID_MAP[SupportedTokens.USDC]

export async function GET(req: NextRequest) {
  const tokens = req.nextUrl.searchParams.get('tokens')

  if (!tokens) {
    return new Response(
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
    return new Response(
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
  try {
    const res = await fetch(
      `${COINMARKETCAP_API}?${new URLSearchParams({
        id: tokenIds,
        aux: 'is_active',
        convert_id: USDC_TOKEN_ID,
      })}`,
      {
        next: {
          revalidate: 600,
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

    const { data }: CoinMarketCapRes = await res.json()

    const prices = splitTokens.reduce(
      (acc, cur) => {
        const tokenId = CMC_TOKEN_ID_MAP[cur]
        const quoteData = data[tokenId]?.quote[USDC_TOKEN_ID]
        if (quoteData) {
          return {
            ...acc,
            [cur]: quoteData.price.toString(),
          }
        } else {
          return {
            ...acc,
            [cur]: 'Data not available',
          }
        }
      },
      {} as Record<SupportedTokens, string>
    )

    // return new NextResponse(
    //   JSON.stringify({ success: false, message: 'authentication failed' }),
    //   { status: 401, headers: { 'content-type': 'application/json' } },
    //   );

    // Return the data
    const response = NextResponse.json({ prices: prices })

    // Set Cache-Control headers
    // Set Cache-Control headers for 1 minute
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60')

    return response
  } catch (error) {
    // Return an error message
    return NextResponse.json(
      {
        message: 'An error occurred while fetching data',
        error: (error as Error).message,
        prices: splitTokens.reduce(
          (acc, token) => ({ ...acc, [token]: '0.0' }),
          {} as Record<SupportedTokens, string>
        ),
      },
      { status: 500 }
    )
  }
}
