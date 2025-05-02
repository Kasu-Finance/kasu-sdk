import { useWallets } from '@privy-io/react-auth'
import { KasuSdk } from '@solidant/kasu-sdk'
import { PoolOverviewDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import { ethers } from 'ethers'
import useSWR, { preload } from 'swr'
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

export class KasuSdkNotReadyError extends Error {
  constructor() {
    super('KasuSDK is not ready')
    this.name = 'SDK Error'
  }
}

const useKasuSDK = () => {
  const { wallets } = useWallets()

  const wallet = wallets[0]

  const { data: unusedPools } = useSWRImmutable<string[]>(
    'unusedPools',
    unusedPoolsFetcher
  )

  const { data, error } = useSWR(
    wallet ? ['kasuSDK', wallet] : null,

    async ([_, wallet]) => {
      const privyProvider = await wallet.getEthereumProvider()

      const provider = new ethers.providers.Web3Provider(privyProvider)

      return new KasuSdk(
        {
          ...sdkConfig,
          UNUSED_LENDING_POOL_IDS: unusedPools?.length ? unusedPools : [''],
        },
        provider.getSigner()
      )
    }
  )

  if (error) {
    console.error(error)
  }

  return data
}

export default useKasuSDK
