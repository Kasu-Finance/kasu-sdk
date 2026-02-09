'use server'

import { JsonRpcProvider } from '@ethersproject/providers'
import { KasuSdk, SdkConfig } from '@kasufinance/kasu-sdk'
// @ts-ignore: xhr2 type exported as any
import { XMLHttpRequest } from 'xhr2'

import { getUnusedPools } from '@/app/_requests/unusedPools'
import { DEFAULT_CHAIN_ID, getChainConfig } from '@/config/chains'
import sdkConfig, { NETWORK } from '@/config/sdk'
import { SupportedChainIds } from '@/connection/chains'
import { RPC_URLS } from '@/connection/rpc'

global.XMLHttpRequest = XMLHttpRequest

const CURRENT_NETWORK =
  NETWORK === 'BASE'
    ? SupportedChainIds['BASE']
    : SupportedChainIds['BASE_SEPOLIA']

// Cache providers by chainId to avoid recreating them
const providerCache = new Map<number, JsonRpcProvider>()

const getProvider = (chainId: number): JsonRpcProvider => {
  if (providerCache.has(chainId)) {
    return providerCache.get(chainId)!
  }

  const chainConfig = getChainConfig(chainId)
  const rpcUrl = chainConfig?.rpcUrls[0] ?? RPC_URLS[CURRENT_NETWORK][0]

  const provider = new JsonRpcProvider({
    url: rpcUrl,
    skipFetchSetup: true,
  })

  providerCache.set(chainId, provider)
  return provider
}

export const getKasuSDK = async (chainId?: number) => {
  const effectiveChainId = chainId ?? DEFAULT_CHAIN_ID
  const chainConfig = getChainConfig(effectiveChainId)
  const unusedPools = await getUnusedPools()
  const provider = getProvider(effectiveChainId)

  // Use chain-specific config if available, fallback to default
  if (chainConfig) {
    return new KasuSdk(
      new SdkConfig({
        subgraphUrl: chainConfig.subgraphUrl,
        contracts: chainConfig.contracts,
        directusUrl: 'https://kasu-finance.directus.app/',
        UNUSED_LENDING_POOL_IDS: unusedPools.length ? unusedPools : [''],
        isLiteDeployment: chainConfig.isLiteDeployment,
        poolMetadataMapping: chainConfig.poolMetadataMapping,
      }),
      provider
    )
  }

  // Fallback to legacy config
  return new KasuSdk(
    {
      ...sdkConfig,
      UNUSED_LENDING_POOL_IDS: unusedPools.length ? unusedPools : [''],
    },
    provider
  )
}
