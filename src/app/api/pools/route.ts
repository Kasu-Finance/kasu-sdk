import { unstable_cache } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import { getKasuSDK } from '@/server/getKasuSDK.server'

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
  return NextResponse.json({ poolOverview: pools }, { status: 200 })
}
