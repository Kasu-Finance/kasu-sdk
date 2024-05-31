import { NextRequest } from 'next/server'

import { SupportedTokens } from '@/constants/tokens'

import { ValueOf } from '@/types/utils'

type CoinMarketCapRes = {
  data: Record<
    ValueOf<typeof CMC_TOKEN_ID_MAP>,
    {
      quote: Record<
        ValueOf<typeof CMC_TOKEN_ID_MAP>,
        {
          price: number
        }
      >
    }
  >
}

const CMC_TOKEN_ID_MAP = {
  [SupportedTokens.USDT]: '825',
  [SupportedTokens.USDC]: '3408',
  [SupportedTokens.ETH]: '1027',
} as const satisfies Record<SupportedTokens, string>

const USDC_TOKEN_ID = CMC_TOKEN_ID_MAP[SupportedTokens.USDC]

export async function GET(req: NextRequest) {
  const tokens = req.nextUrl.searchParams.get('tokens')

  if (!tokens) {
    return Response.json(
      { message: 'Parameter "tokens" is missing from the request' },
      { status: 400 }
    )
  }

  const splitTokens = tokens.split(',') as SupportedTokens[]

  let tokenIds: string

  if (splitTokens.length > 1) {
    tokenIds = splitTokens
      .map((token) => CMC_TOKEN_ID_MAP[token as SupportedTokens])
      .join(',')
  } else {
    tokenIds = CMC_TOKEN_ID_MAP[splitTokens[0] as SupportedTokens]
  }

  const url =
    'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest'

  const res = await fetch(
    `${url}?${new URLSearchParams({ id: tokenIds, aux: 'is_active', convert_id: USDC_TOKEN_ID })}`,
    {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY?.toString() || '',
      },
    }
  )

  const { data }: CoinMarketCapRes = await res.json()

  let prices: string | Record<SupportedTokens, string>

  if (splitTokens.length > 1) {
    prices = splitTokens.reduce(
      (acc, cur) => {
        const tokenId = CMC_TOKEN_ID_MAP[cur]

        return {
          ...acc,
          [cur]: data[tokenId].quote[USDC_TOKEN_ID].price.toString(),
        }
      },
      {} as Record<SupportedTokens, string>
    )
  } else {
    prices =
      data[CMC_TOKEN_ID_MAP[splitTokens[0]]].quote[
        USDC_TOKEN_ID
      ].price.toString()
  }

  return Response.json({ prices })
}
