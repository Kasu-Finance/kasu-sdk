import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { unstable_cache } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { getKasuSDK } from '@/actions/getKasuSDK'

const API_ROUTE_TTL = 60 * 60 // 1 hour
const CACHE_TTL = 60 * 60 // 1 hour

export const getPoolOverview = unstable_cache(
  async (poolId?: string) => {
    const sdk = await getKasuSDK()
    const arg = poolId ? [poolId] : undefined
    return await sdk.DataService.getPoolOverview(arg)
  },
  ['poolOverview'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['pools'],
    revalidate: CACHE_TTL,
  }
)

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)

  const id = searchParams.getAll('id').join(',')

  try {
    const pools: PoolOverview[] = await getPoolOverview(id)

    const response = NextResponse.json({ poolOverview: pools }, { status: 200 })

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
