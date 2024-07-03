import { PoolDelegateProfileAndHistory } from '@solidant/kasu-sdk/src/services/DataService/types'
import { unstable_cache } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { getKasuSDK } from '@/actions/getKasuSDK'

export const dynamic = 'force-dynamic'

const API_ROUTE_TTL = 60 * 60 // 1 hour
const CACHE_TTL = 60 * 60 // 1 hour

const getPoolDelegate = unstable_cache(
  async () => {
    const sdk = await getKasuSDK()

    return await sdk.DataService.getPoolDelegateProfileAndHistory()
  },
  ['poolDelegateProfileAndHistory'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['poolDelegate'],
    revalidate: CACHE_TTL,
  }
)

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const pools: PoolDelegateProfileAndHistory[] =
      (await getPoolDelegate()) ?? []

    const response = NextResponse.json(pools, { status: 200 })

    response.headers.set(
      'Cache-Control',
      `public, max-age=${API_ROUTE_TTL}, s-maxage=${API_ROUTE_TTL}`
    )

    return response
  } catch (error) {
    return NextResponse.json(
      {
        message: 'An error occurred while fetching data',
        error: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
