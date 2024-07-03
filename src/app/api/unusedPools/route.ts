import { PoolOverviewDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'

import sdkConfig from '@/config/sdk'

const API_ROUTE_TTL = 60 * 60 // 1 hour
const CACHE_TTL = 60 * 60 // 1 hour

const filteredCachedPools = unstable_cache(
  async (unusedPools: PoolOverviewDirectus[]) => {
    return unusedPools.map((pool) => pool.id)
  },
  ['filteredUnusedPools'],
  {
    // use it to revalidate/flush cache with revalidateTag()
    tags: ['filteredUnusedPools'],
    revalidate: CACHE_TTL,
  }
)
export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(
      `${sdkConfig.directusUrl}items/PoolOverview?filter[enabled][_neq]=true`,
      {
        next: { revalidate: 60 * 15, tags: ['unusedPools'] },
      }
    )

    if (!res.ok) {
      throw new Error(
        `Failed to fetch unused pools data: ${res.status} ${res.statusText}`
      )
    }

    const unusedPools: { data: PoolOverviewDirectus[] } = await res.json()
    const filteredPools = await filteredCachedPools(unusedPools.data)

    const response = NextResponse.json(filteredPools, { status: 200 })

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
