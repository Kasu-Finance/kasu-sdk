import { NextResponse } from 'next/server'

import { getPoolOverview } from '@/app/_requests/pools'

export const GET = async () => {
  const pools = await getPoolOverview()
  return NextResponse.json(pools)
}
