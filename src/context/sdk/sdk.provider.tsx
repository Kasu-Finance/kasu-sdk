'use client'

import { KasuSdk } from '@kasufinance/kasu-sdk'
import { SdkConfig } from '@kasufinance/kasu-sdk/src/sdk-config'
import type { PoolOverviewDirectus } from '@kasufinance/kasu-sdk/src/services/DataService/directus-types'
import { useSendTransaction, useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import { preload } from 'swr'
import useSWRImmutable from 'swr/immutable'

import { useChain } from '@/hooks/context/useChain'
import usePrivyAuthenticated from '@/hooks/web3/usePrivyAuthenticated'

import SdkContext from '@/context/sdk/sdk.context'

import { wrapQueuedProvider } from '@/utils/rpc/rpcQueue'
import isPrivyEmbeddedWallet from '@/utils/web3/isPrivyEmbeddedWallet'

const DIRECTUS_URL = 'https://kasu-finance.directus.app/'

const unusedPoolsFetcher = async () => {
  const res = await fetch(
    `${DIRECTUS_URL}items/PoolOverview?filter[enabled][_neq]=true`
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
  const { sendTransaction } = useSendTransaction()
  const { address } = usePrivyAuthenticated()
  const { chainConfig, currentChainId } = useChain()

  const wallet = wallets.find((wallet) => wallet.address === address)

  const { data: unusedPools } = useSWRImmutable<string[]>(
    'unusedPools',
    unusedPoolsFetcher
  )

  // Recreate SDK when chain or wallet changes
  useEffect(() => {
    if (!wallet || !unusedPools) return
    ;(async () => {
      try {
        const shouldSponsor = isPrivyEmbeddedWallet(wallet)
        const privyProvider = wrapQueuedProvider(
          await wallet.getEthereumProvider(),
          {
            maxConcurrent: 1,
            sponsorTransactions: shouldSponsor,
            sendTransaction: shouldSponsor ? sendTransaction : undefined,
            sendTransactionAddress: wallet.address,
          }
        )
        if (!privyProvider) return

        const provider = new ethers.providers.Web3Provider(privyProvider)

        const sdk = new KasuSdk(
          new SdkConfig({
            subgraphUrl: chainConfig.subgraphUrl,
            contracts: chainConfig.contracts,
            directusUrl: DIRECTUS_URL,
            UNUSED_LENDING_POOL_IDS: unusedPools?.length ? unusedPools : [''],
            isLiteDeployment: chainConfig.isLiteDeployment,
          }),
          provider.getSigner()
        )

        setKasuSdk(sdk)
      } catch (error) {
        console.error(error)
      }
    })()
  }, [wallet, unusedPools, sendTransaction, chainConfig, currentChainId])

  return (
    <SdkContext.Provider value={{ sdk: kasuSdk }}>
      {children}
    </SdkContext.Provider>
  )
}

export default SdkState
