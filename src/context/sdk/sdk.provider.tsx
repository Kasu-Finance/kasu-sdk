'use client'

import { KasuSdk } from '@kasufinance/kasu-sdk'
import { PoolOverviewDirectus } from '@kasufinance/kasu-sdk/src/services/DataService/directus-types'
import { useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import { preload } from 'swr'
import useSWRImmutable from 'swr/immutable'

import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import SdkContext from '@/context/sdk/sdk.context'

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

const SdkState: React.FC<PropsWithChildren> = ({ children }) => {
  const [kasuSdk, setKasuSdk] = useState<KasuSdk | undefined>(undefined)

  const { wallets } = useWallets()

  const { address } = usePrivyAuthenticated()

  const wallet = wallets.find((wallet) => wallet.address === address)

  const { data: unusedPools } = useSWRImmutable<string[]>(
    'unusedPools',
    unusedPoolsFetcher
  )

  useEffect(() => {
    if (!wallet || !unusedPools) return
    ;(async () => {
      try {
        const privyProvider = await wallet.getEthereumProvider()

        const provider = new ethers.providers.Web3Provider(privyProvider)

        const sdk = new KasuSdk(
          {
            ...sdkConfig,
            UNUSED_LENDING_POOL_IDS: unusedPools?.length ? unusedPools : [''],
          },
          provider.getSigner()
        )

        setKasuSdk(sdk)
      } catch (error) {
        console.error(error)
      }
    })()
  }, [wallet, unusedPools])

  return (
    <SdkContext.Provider value={{ sdk: kasuSdk }}>
      {children}
    </SdkContext.Provider>
  )
}

export default SdkState
