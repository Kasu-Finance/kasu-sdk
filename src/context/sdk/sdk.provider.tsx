'use client'

import {
  KasuSdk,
  type PoolOverviewDirectus,
  SdkConfig,
} from '@kasufinance/kasu-sdk'
import { useSendTransaction, useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { preload, useSWRConfig } from 'swr'
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
  const [isChainTransitioning, setIsChainTransitioning] = useState(false)

  const { wallets } = useWallets()
  const { sendTransaction } = useSendTransaction()
  const { address } = usePrivyAuthenticated()
  const { chainConfig, currentChainId } = useChain()
  const { mutate } = useSWRConfig()

  // Track previous chain to detect changes
  const prevChainIdRef = useRef<number | null>(null)

  const wallet = wallets.find((wallet) => wallet.address === address)

  const { data: unusedPools } = useSWRImmutable<string[]>(
    'unusedPools',
    unusedPoolsFetcher
  )

  // Clear SDK and cache immediately when chain changes to prevent stale data
  useEffect(() => {
    if (prevChainIdRef.current === null) {
      prevChainIdRef.current = currentChainId
      return
    }

    if (prevChainIdRef.current !== currentChainId) {
      // Chain is changing - clear SDK and set transitioning flag
      setKasuSdk(undefined)
      setIsChainTransitioning(true)
      prevChainIdRef.current = currentChainId

      // Clear all SWR cache data immediately (not just invalidate)
      // This prevents stale data from old chain being shown
      void mutate(
        () => true,
        undefined,
        { revalidate: false } // Don't trigger refetch yet - wait for SDK
      )
    }
  }, [currentChainId, mutate])

  // Recreate SDK when chain or wallet changes
  useEffect(() => {
    if (!wallet || !unusedPools) return
    ;(async () => {
      try {
        const shouldSponsor = isPrivyEmbeddedWallet(wallet)
        const rawProvider = await wallet.getEthereumProvider()
        if (!rawProvider) return

        // Only wrap with Proxy for embedded wallets that need sponsorship + queuing.
        // External wallets use their own RPC and don't need the Proxy layer,
        // which can interfere with ethers' transaction response parsing.
        const privyProvider = shouldSponsor
          ? wrapQueuedProvider(rawProvider, {
              maxConcurrent: 1,
              sponsorTransactions: true,
              sendTransaction,
              sendTransactionAddress: wallet.address,
            })
          : rawProvider
        if (!privyProvider) return

        const provider = new ethers.providers.Web3Provider(privyProvider)

        const sdk = new KasuSdk(
          new SdkConfig({
            subgraphUrl: chainConfig.subgraphUrl,
            contracts: chainConfig.contracts,
            directusUrl: DIRECTUS_URL,
            UNUSED_LENDING_POOL_IDS: unusedPools?.length ? unusedPools : [''],
            isLiteDeployment: chainConfig.isLiteDeployment,
            poolMetadataMapping: chainConfig.poolMetadataMapping,
          }),
          provider.getSigner()
        )

        setKasuSdk(sdk)
        setIsChainTransitioning(false)

        // Trigger revalidation after React has committed state updates
        // setTimeout(0) ensures this runs in a new task after the current render cycle
        // This is needed because we cleared cache during chain transition
        setTimeout(() => {
          void mutate(() => true, undefined, { revalidate: true })
        }, 0)
      } catch (error) {
        console.error(error)
        setIsChainTransitioning(false)
      }
    })()
  }, [
    wallet,
    unusedPools,
    sendTransaction,
    chainConfig,
    currentChainId,
    mutate,
  ])

  return (
    <SdkContext.Provider value={{ sdk: kasuSdk, isChainTransitioning }}>
      {children}
    </SdkContext.Provider>
  )
}

export default SdkState
