import { PoolOverviewDirectus } from '@kasufinance/kasu-sdk'
import { preload } from 'swr'
import useSWRImmutable from 'swr/immutable'

import sdkConfig from '@/config/sdk'

const unusedPoolsFetcher = async () => {
  const res = await fetch(
    `${sdkConfig.directusUrl}items/PoolOverview?filter[enabled][_neq]=true`
  )

  if (!res.ok) {
    throw new Error(
      `Failed to fetch unused pools data: ${res.status} ${res.statusText}`
    )
  }

  const unusedPools: { data: PoolOverviewDirectus[] } = await res.json()
  const filteredPools = unusedPools.data.map((pool) => pool.id)

  return filteredPools
}

preload('unusedPools', unusedPoolsFetcher)

const useUnusedPools = () => {
  const { data: unusedPools } = useSWRImmutable<string[]>(
    'unusedPools',
    unusedPoolsFetcher
  )

  return unusedPools?.length ? unusedPools : ['']
}

export default useUnusedPools
