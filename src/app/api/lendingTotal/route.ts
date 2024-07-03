import { PoolOverview } from '@solidant/kasu-sdk/src/services/DataService/types'
import { unstable_cache } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { GET as fetchPools } from '@/app/api/pools/route'
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
    const poolsResponse = await fetchPools(req)

    if (!poolsResponse.ok) {
      throw new Error(
        `Failed to fetch pools data: ${poolsResponse.status} ${poolsResponse.statusText}`
      )
    }

    const pools = await poolsResponse.json()

    const totals = (await getPoolsTotals(pools.poolOverview)) ?? {
      totalValueLocked: 0,
      loansUnderManagement: 0,
      totalLoanFundsOriginated: 0,
      totalLossRate: 0,
      totalYieldEarned: 0,
    }

    const nextResponse = NextResponse.json(totals, { status: 200 })

    nextResponse.headers.set(
      'Cache-Control',
      `public, max-age=${API_ROUTE_TTL}, s-maxage=${API_ROUTE_TTL}`
    )

    return nextResponse
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
