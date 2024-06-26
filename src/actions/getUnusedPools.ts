'use server'

import { PoolOverviewDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'

import sdkConfig from '@/config/sdk'

const getUnusedPools = async () => {
  'use server'
  const res = await fetch(
    `${sdkConfig.directusUrl}items/PoolOverview?filter[enabled][_neq]=true`,
    { cache: 'no-store' }
  )
  const unusedPools: { data: PoolOverviewDirectus[] } = await res.json()

  return unusedPools.data.map((pool) => pool.id)
}

export default getUnusedPools
