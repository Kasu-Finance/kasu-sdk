import { NextRequest, NextResponse } from 'next/server'

import { getPoolOverview } from '@/app/_requests/pools'

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const chainId = searchParams.get('chainId')
    ? parseInt(searchParams.get('chainId')!, 10)
    : undefined

  const pools = await getPoolOverview(undefined, chainId)
  return NextResponse.json(pools)
}
