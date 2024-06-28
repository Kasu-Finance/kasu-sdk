import { unstable_cache } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { getKasuSDK } from '@/server/getKasuSDK.server'

export const dynamic = 'force-dynamic'

const sdk = getKasuSDK()

const getPoolOverview = unstable_cache(
  async (poolId?: string) => {
    const arg = poolId ? [poolId] : undefined

    return await sdk.DataService.getPoolOverview(arg)
  },
  ['poolOverview']
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const id = searchParams.getAll('id').join(',')

  const pools = await getPoolOverview(id)

  const response = NextResponse.json({ poolOverview: pools }, { status: 200 })

  // Set Cache-Control headers for 1 minute
  response.headers.set('Cache-Control', 'public, max-age=600, s-maxage=600')

  return response
}
