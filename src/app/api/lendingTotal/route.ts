import {
  LendingTotals,
  PoolOverview,
} from '@solidant/kasu-sdk/src/services/DataService/types'
import { unstable_cache } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { getKasuSDK } from '@/server/getKasuSDK.server'

const sdk = getKasuSDK()

export const dynamic = 'force-dynamic'

const API_ROUTE_TTL = 60 * 60 // 1 hour
const CACHE_TTL = 60 * 60 // 1 hour

const getPoolsTotals = unstable_cache(
  async (poolOverviews: PoolOverview[]) => {
    return await sdk.DataService.getLendingTotals(poolOverviews)
  },
  ['totals'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['totals'],
    revalidate: CACHE_TTL,
  }
)

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const protocol = req.headers.get('x-forwarded-proto') || 'https'
    const host = req.headers.get('host')

    const baseUrl = `${protocol}://${host}`
    const data = await fetch(`${baseUrl}/api/pools`)
    const pools = await data.json()

    const totals: LendingTotals = await getPoolsTotals(pools.poolOverview)

    const response = NextResponse.json(totals, { status: 200 })

    response.headers.set(
      'Cache-Control',
      `public, max-age=${API_ROUTE_TTL}, s-maxage=${API_ROUTE_TTL}`
    )

    return response
  } catch (error) {
    console.error('Error fetching lending totals:', error)
    return NextResponse.json(
      {
        message: 'An error occurred while fetching lending totals',
        error: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
