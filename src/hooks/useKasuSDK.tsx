import { JsonRpcProvider } from '@ethersproject/providers'
import { KasuSdk } from '@solidant/kasu-sdk'
import { PoolOverviewDirectus } from '@solidant/kasu-sdk/src/services/DataService/directus-types'
import { useWeb3React } from '@web3-react/core'
import useSWR, { preload } from 'swr'
import useSWRImmutable from 'swr/immutable'

import sdkConfig, { NETWORK } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'

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

const useKasuSDK = () => {
  const { provider, account } = useWeb3React()

  const { data: unusedPools } = useSWRImmutable<string[]>(
    'unusedPools',
    unusedPoolsFetcher
  )

  const { data, error } = useSWR(
    provider && account ? ['kasuSDK', provider, account] : null,
    async ([_, provider]) => {
      return new KasuSdk(
        {
          ...sdkConfig,
          UNUSED_LENDING_POOL_IDS: unusedPools?.length ? unusedPools : [''],
        },
        provider.getSigner()
      )
    },
    {
      fallback: () => {
        const chain =
          NETWORK === 'BASE'
            ? SupportedChainIds.BASE
            : SupportedChainIds.BASE_SEPOLIA

        const fallbackProvider = new JsonRpcProvider(RPC_URLS[chain][0])

        return new KasuSdk(
          {
            ...sdkConfig,
            UNUSED_LENDING_POOL_IDS: unusedPools?.length ? unusedPools : [''],
          },
          fallbackProvider
        )
      },
    }
  )

  if (error) {
    console.error(error)
  }

  return data!
}

export default useKasuSDK
