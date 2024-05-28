'use server'

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

async function getTokenPrice(tokens: SupportedTokens): Promise<string>
async function getTokenPrice(
  tokens: SupportedTokens[]
): Promise<Record<SupportedTokens, string>>

async function getTokenPrice(
  tokens: SupportedTokens | SupportedTokens[]
): Promise<unknown> {
  let tokenIds: string

  if (Array.isArray(tokens)) {
    tokenIds = tokens.map((token) => CMC_TOKEN_ID_MAP[token]).join(',')
  } else {
    tokenIds = CMC_TOKEN_ID_MAP[tokens]
  }

  const USDC_TOKEN_ID = CMC_TOKEN_ID_MAP[SupportedTokens.USDC]

  const url =
    'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest'

  const res = await fetch(
    `${url}?${new URLSearchParams({ id: tokenIds, aux: 'is_active', convert_id: USDC_TOKEN_ID })}`,
    {
      headers: {
        'X-CMC_PRO_API_KEY': '0d9ae267-9e42-408f-ad93-4b9b643bd981',
      },
    }
  )

  const { data }: CoinMarketCapRes = await res.json()

  if (Array.isArray(tokens)) {
    return tokens.reduce(
      (acc, cur) => {
        const tokenId = CMC_TOKEN_ID_MAP[cur]

        return {
          ...acc,
          [cur]: data[tokenId].quote[USDC_TOKEN_ID].price.toString(),
        }
      },
      {} as Record<SupportedTokens, string>
    )
  }

  return data[CMC_TOKEN_ID_MAP[tokens]].quote[USDC_TOKEN_ID].price.toString()
}

export default getTokenPrice
